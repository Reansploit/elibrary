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

        $commands = \App\Services\DeviceIngest::ingest($device, [
            'app_open' => $validated['app_open'],
            'active_title' => $validated['active_title'] ?? null,
            'apps' => $validated['apps'] ?? [],
            'ip' => $request->ip(),
        ]);

        if (! empty($validated['agent_version'])) {
            $device->update(['agent_version' => $validated['agent_version']]);
        }

        return response()->json([
            'commands' => $commands->map(fn ($c) => [
                'id' => $c->id,
                'action' => $c->action,
                'target' => $c->payload ? [
                    'exe' => $c->payload['exe'] ?? null,
                    'launch' => $c->payload['launch'] ?? null,
                ] : null,
            ])->values(),
            'app_expected' => (bool) $device->app_expected,
            'managed' => $device->effectiveApps()->map(fn ($a) => [
                'exe' => $a->exe,
                'launch' => $a->launch,
                'reopen' => (bool) $a->auto_reopen,
            ])->values(),
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
