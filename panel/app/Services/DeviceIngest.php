<?php

namespace App\Services;

use App\Models\Device;
use App\Models\DeviceCommand;
use Carbon\Carbon;

/**
 * Inti pemrosesan laporan status PC. Dipakai jalur agen (heartbeat)
 * maupun sinkronisasi LUNAR (WinRM) — satu aturan untuk semua.
 */
class DeviceIngest
{
    public static function ingest(Device $device, array $data)
    {
        $wasOnline = $device->isOnline();
        $wasOpen = (bool) $device->app_open;
        $isOpen = (bool) ($data['app_open'] ?? false);
        $title = isset($data['active_title']) && $data['active_title'] !== ''
            ? mb_substr($data['active_title'], 0, 255)
            : null;
        $apps = array_values(array_slice($data['apps'] ?? [], 0, 25));

        if ($device->last_seen_at && ! $wasOnline) {
            $gapMinutes = (int) $device->last_seen_at->diffInMinutes(now());
            $device->log('online', "Kembali setelah ~{$gapMinutes} mnt");
            if ($gapMinutes >= 10) {
                $device->raiseAlert('offline_gap', "Offline ±{$gapMinutes} menit");
            }
        }

        if ($isOpen && ! $wasOpen) {
            $device->log('app_opened');
            $device->alerts()->where('kind', 'unexpected_close')->where('handled', false)
                ->update(['handled' => true]);
            $device->closed_beats = 0;
            $device->foreign_beats = 0;
        } elseif (! $isOpen && $wasOpen) {
            $device->log('app_closed', $title ? "Terakhir: {$title}" : null);
        }

        if (! $isOpen) {
            $device->closed_beats++;
            if ($device->closed_beats === 2) {
                $device->raiseAlert('unexpected_close', 'App tertutup padahal PC hidup');
            }
        } else {
            $device->closed_beats = 0;
        }

        if (! $isOpen && $title && $title !== $device->last_foreign_title) {
            $others = array_values(array_filter(
                $apps,
                fn ($a) => mb_strtolower($a) !== mb_strtolower($title)
            ));
            $detail = $title;
            if (count($others) > 0) {
                $detail .= ' | juga terbuka: ' . mb_substr(implode(', ', array_slice($others, 0, 5)), 0, 150);
            }
            $device->log('foreign_window', $detail);
            $device->last_foreign_title = $title;
            $device->foreign_beats = 1;
        } elseif (! $isOpen && $title && $title === $device->last_foreign_title) {
            $device->foreign_beats++;
            if ($device->foreign_beats === 2) {
                $device->raiseAlert('foreign_app', "Terbuka: {$title}");
            }
        } elseif ($isOpen || ! $title) {
            $device->foreign_beats = 0;
            if ($isOpen) {
                $device->last_foreign_title = null;
            }
        }

        $device->update([
            'ip' => $data['ip'] ?? $device->ip,
            'app_open' => $isOpen,
            'active_title' => $title,
            'open_apps' => $apps,
            'last_seen_at' => now(),
        ]);

        $commands = DeviceCommand::where('device_id', $device->id)
            ->where('status', 'pending')
            ->orderBy('id')
            ->get();

        foreach ($commands as $command) {
            $command->update(['claimed_at' => now()]);
        }

        return $commands;
    }
}
