<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Device;
use App\Models\DeviceCommand;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $q = trim($request->query('q', ''));
        $tab = $request->query('tab', 'semua');
        if (! in_array($tab, ['semua', 'online', 'perhatian'], true)) {
            $tab = 'semua';
        }

        $devices = Device::withCount(['alerts as unhandled_alerts' => fn ($query) => $query->where('handled', false)])
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like) {
                    $w->where('hostname', 'like', $like)
                        ->orWhere('custom_name', 'like', $like)
                        ->orWhere('mac', 'like', $like)
                        ->orWhere('ip', 'like', $like);
                });
            })
            ->orderBy('hostname')
            ->get();

        if ($tab === 'online') {
            $devices = $devices->filter->isOnline()->values();
        } elseif ($tab === 'perhatian') {
            $devices = $devices->filter(fn ($d) => $d->unhandled_alerts > 0 || ! $d->isOnline())->values();
        }

        $all = Device::withCount(['alerts as unhandled_alerts' => fn ($query) => $query->where('handled', false)])->get();

        $stats = [
            'total' => $all->count(),
            'online' => $all->filter->isOnline()->count(),
            'app_open' => $all->where('app_open', true)->count(),
            'alerts' => Alert::where('handled', false)->count(),
        ];

        return view('devices.index', compact('devices', 'stats', 'q', 'tab'));
    }

    public function show(Request $request, Device $device)
    {
        $tab = $request->query('tab', 'ringkasan');
        if (! in_array($tab, ['ringkasan', 'aktivitas'], true)) {
            $tab = 'ringkasan';
        }
        $kind = $request->query('jenis', 'semua');

        $logs = $device->logs()
            ->when($kind !== 'semua', fn ($query) => $query->where('kind', $kind))
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $kinds = $device->logs()
            ->selectRaw('kind, COUNT(*) as jml')
            ->groupBy('kind')
            ->pluck('jml', 'kind');

        $alerts = $device->alerts()->orderBy('id', 'desc')->limit(50)->get();
        $pending = $device->commands()->where('status', 'pending')->orderBy('id')->get();

        if ($request->expectsJson()) {
            return response()->json([
                'html' => view('devices.partials.timeline', ['logs' => $logs, 'kind' => $kind, 'device' => $device])->render(),
                'total' => $logs->total() . ' kejadian',
            ]);
        }

        return view('devices.show', compact('device', 'alerts', 'pending', 'tab', 'logs', 'kinds', 'kind'));
    }

    public function rename(Request $request, Device $device)
    {
        $validated = $request->validate([
            'custom_name' => 'nullable|string|max:100',
        ]);

        $old = $device->displayName();
        $device->update(['custom_name' => $validated['custom_name'] ?: null]);
        $device->log('renamed', "{$old} → {$device->displayName()}");

        return back()->with('success', 'Nama PC diperbarui.');
    }

    public function command(Request $request, Device $device)
    {
        $validated = $request->validate([
            'action' => 'required|in:open_app,close_app,restart_agent',
        ]);

        $command = $device->commands()->create([
            'action' => $validated['action'],
            'status' => 'pending',
        ]);

        $device->log('command', "Antre: {$command->label()}");

        return back()->with('success', "Perintah {$command->label()} diantrekan. Dijalankan saat agen lapor.");
    }

    public function handleAlert(Alert $alert)
    {
        $alert->update(['handled' => true]);

        return back()->with('success', 'Alert ditandai selesai.');
    }

    public function cancelCommand(DeviceCommand $command)
    {
        if ($command->status !== 'pending') {
            return back()->with('error', 'Perintah sudah diproses agen.');
        }

        $command->update(['status' => 'failed', 'done_at' => now()]);
        $command->device->log('command', "Dibatalkan guru: {$command->label()}");

        return back()->with('success', 'Perintah pending dibatalkan.');
    }

    public function destroy(Device $device)
    {
        $name = $device->displayName();
        $device->delete();

        return redirect()->route('devices.index')
            ->with('success', "{$name} dihapus dari panel. Agen di PC akan daftar ulang otomatis bila masih jalan.");
    }
}
