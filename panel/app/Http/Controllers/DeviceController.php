<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Device;
use App\Models\DeviceCommand;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::withCount(['alerts as unhandled_alerts' => fn ($q) => $q->where('handled', false)])
            ->orderBy('hostname')
            ->get();

        $stats = [
            'total' => $devices->count(),
            'online' => $devices->filter->isOnline()->count(),
            'app_open' => $devices->where('app_open', true)->count(),
            'alerts' => Alert::where('handled', false)->count(),
        ];

        return view('devices.index', compact('devices', 'stats'));
    }

    public function show(Device $device)
    {
        $device->load(['logs' => fn ($q) => $q->orderBy('id', 'desc')->limit(100)]);
        $alerts = $device->alerts()->orderBy('id', 'desc')->limit(50)->get();
        $pending = $device->commands()->where('status', 'pending')->orderBy('id')->get();

        return view('devices.show', compact('device', 'alerts', 'pending'));
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
