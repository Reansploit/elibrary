<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\DeviceCommand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgentController extends Controller
{
    /**
     * Pendaftaran perangkat baru (atau enroll ulang).
     * Token mentah hanya dikembalikan sekali di sini.
     */
    public function enroll(Request $request)
    {
        $validated = $request->validate([
            'mac' => 'required|string|max:17',
            'hostname' => 'required|string|max:100',
            'agent_version' => 'nullable|string|max:20',
        ]);

        $mac = strtolower(trim($validated['mac']));
        $token = Str::random(40);

        $device = Device::where('mac', $mac)->first();

        if ($device) {
            $device->update([
                'hostname' => $validated['hostname'],
                'ip' => $request->ip(),
                'token_hash' => hash('sha256', $token),
                'agent_version' => $validated['agent_version'] ?? $device->agent_version,
            ]);
        } else {
            $device = Device::create([
                'mac' => $mac,
                'hostname' => $validated['hostname'],
                'ip' => $request->ip(),
                'token_hash' => hash('sha256', $token),
                'agent_version' => $validated['agent_version'] ?? null,
            ]);
            $device->log('enrolled', "Hostname {$device->hostname}");
        }

        return response()->json([
            'token' => $token,
            'device' => [
                'id' => $device->id,
                'name' => $device->displayName(),
            ],
        ]);
    }

    /**
     * Denyut agen: lapor status + ambil perintah pending.
     */
    public function heartbeat(Request $request)
    {
        /** @var Device $device */
        $device = $request->attributes->get('device');

        $validated = $request->validate([
            'mac' => 'required|string|max:17',
            'app_open' => 'required|boolean',
            'active_title' => 'nullable|string|max:255',
            'apps' => 'nullable|array|max:30',
            'apps.*' => 'string|max:255',
            'agent_version' => 'nullable|string|max:20',
        ]);

        $wasOnline = $device->isOnline();
        $wasOpen = (bool) $device->app_open;
        $isOpen = (bool) $validated['app_open'];
        $rawTitle = $validated['active_title'] ?? null;
        $title = $rawTitle ? mb_substr($rawTitle, 0, 255) : null;

        // Kembali online setelah jeda panjang.
        if ($device->last_seen_at && ! $wasOnline) {
            $gapMinutes = (int) $device->last_seen_at->diffInMinutes(now());
            $device->log('online', "Kembali setelah ~{$gapMinutes} mnt");
            if ($gapMinutes >= 10) {
                $device->raiseAlert('offline_gap', "Offline ±{$gapMinutes} menit");
            }
        }

        // Transisi app dibuka/ditutup.
        if ($isOpen && ! $wasOpen) {
            $device->log('app_opened');
            $device->alerts()->where('kind', 'unexpected_close')->where('handled', false)
                ->update(['handled' => true]);
            $device->closed_beats = 0;
            $device->foreign_beats = 0;
        } elseif (! $isOpen && $wasOpen) {
            $device->log('app_closed', $title ? "Terakhir: {$title}" : null);
        }

        // App mati padahal agen hidup = tutup tak wajar (2 denyut beruntun).
        if (! $isOpen) {
            $device->closed_beats++;
            if ($device->closed_beats === 2) {
                $device->raiseAlert('unexpected_close', 'App tertutup padahal agen hidup');
            }
        } else {
            $device->closed_beats = 0;
        }

        // Window lain di depan saat app tertutup.
        $apps = array_values(array_slice($validated['apps'] ?? [], 0, 25));
        if (! $isOpen && $title && $title !== $device->last_foreign_title) {
            $others = array_values(array_filter($apps, fn ($a) => mb_strtolower($a) !== mb_strtolower($title)));
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
            'ip' => $request->ip(),
            'app_open' => $isOpen,
            'active_title' => $title,
            'open_apps' => array_values(array_slice($validated['apps'] ?? [], 0, 25)),
            'agent_version' => $validated['agent_version'] ?? $device->agent_version,
            'last_seen_at' => now(),
        ]);

        $commands = DeviceCommand::where('device_id', $device->id)
            ->where('status', 'pending')
            ->orderBy('id')
            ->get();

        foreach ($commands as $command) {
            $command->update(['claimed_at' => now()]);
        }

        return response()->json([
            'commands' => $commands->map(fn ($c) => ['id' => $c->id, 'action' => $c->action])->values(),
            'app_expected' => (bool) $device->app_expected,
            'update' => $this->updateInfo($request, $validated['agent_version'] ?? null),
        ]);
    }

    /**
     * Info update agen: bandingkan versi lapor vs manifest rilis.
     */
    private function updateInfo(Request $request, ?string $current): ?array
    {
        try {
            $manifest = json_decode(file_get_contents(public_path('rilis/manifest.json')), true);
        } catch (\Throwable) {
            return null;
        }
        if (! is_array($manifest) || empty($manifest['agent_version']) || empty($manifest['agent_file'])) {
            return null;
        }
        if (! $current || ! version_compare($manifest['agent_version'], $current, '>')) {
            return null;
        }
        $file = basename($manifest['agent_file']);
        if (! is_file(public_path('rilis/' . $file))) {
            return null;
        }

        return [
            'agent_version' => $manifest['agent_version'],
            'agent_url' => rtrim(config('app.url'), '/') . '/rilis/' . $file,
            'notes' => $manifest['notes'] ?? '',
        ];
    }

    /**
     * Konfirmasi hasil perintah oleh agen.
     */
    public function ack(Request $request, int $id)
    {
        /** @var Device $device */
        $device = $request->attributes->get('device');

        $validated = $request->validate([
            'mac' => 'required|string|max:17',
            'status' => 'required|in:done,failed',
        ]);

        $command = DeviceCommand::where('id', $id)
            ->where('device_id', $device->id)
            ->firstOrFail();

        $command->update([
            'status' => $validated['status'],
            'done_at' => now(),
        ]);

        $device->log('command', $command->label() . ' → ' . $validated['status']);

        return response()->json(['ok' => true]);
    }
}
