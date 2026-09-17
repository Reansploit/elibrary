<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ManagerController extends Controller
{
    /**
     * Login guru → token Sanctum untuk app LUNAR.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:50',
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        $token = $user->createToken($validated['device_name'] ?? 'lunar')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }

    private function present(Device $d): array
    {
        return [
            'id' => $d->id,
            'name' => $d->displayName(),
            'hostname' => $d->hostname,
            'mac' => $d->mac,
            'ip' => $d->ip,
            'agent_version' => $d->agent_version,
            'online' => $d->isOnline(),
            'app_open' => (bool) $d->app_open,
            'app_expected' => (bool) ($d->app_expected ?? true),
            'active_title' => $d->active_title,
            'open_apps' => $d->open_apps ?? [],
            'unhandled_alerts' => $d->alerts()->where('handled', false)->count(),
            'last_seen_at' => $d->last_seen_at?->toISOString(),
            'last_seen_human' => $d->last_seen_at?->diffForHumans(),
        ];
    }

    public function devices()
    {
        $devices = Device::orderBy('hostname')->get()->map(fn ($d) => $this->present($d));

        return response()->json([
            'stats' => [
                'total' => $devices->count(),
                'online' => $devices->where('online', true)->count(),
                'app_open' => $devices->where('app_open', true)->count(),
                'alerts' => Alert::where('handled', false)->count(),
            ],
            'devices' => $devices->values(),
        ]);
    }

    public function show(Device $device)
    {
        $device->load(['logs' => fn ($q) => $q->orderBy('id', 'desc')->limit(50)]);

        return response()->json([
            'device' => $this->present($device),
            'pending' => $device->commands()->where('status', 'pending')->orderBy('id')->get()
                ->map(fn ($c) => ['id' => $c->id, 'action' => $c->action, 'label' => $c->label()])->values(),
            'alerts' => $device->alerts()->orderBy('id', 'desc')->limit(50)->get()
                ->map(fn ($a) => [
                    'id' => $a->id, 'kind' => $a->kind, 'label' => $a->label(),
                    'message' => $a->message, 'handled' => (bool) $a->handled,
                    'at' => $a->created_at?->format('d/m/Y H:i'),
                ])->values(),
            'logs' => $device->logs->map(fn ($l) => [
                'kind' => $l->kind, 'label' => $l->label(), 'detail' => $l->detail,
                'at' => $l->created_at?->format('d/m/Y H:i'),
            ])->values(),
        ]);
    }

    public function rename(Request $request, Device $device)
    {
        $validated = $request->validate(['custom_name' => 'nullable|string|max:100']);
        $old = $device->displayName();
        $device->update(['custom_name' => $validated['custom_name'] ?: null]);
        $device->log('renamed', "{$old} → {$device->displayName()}");

        return response()->json(['ok' => true, 'device' => $this->present($device->fresh())]);
    }

    public function command(Request $request, Device $device)
    {
        $validated = $request->validate([
            'action' => 'required|in:open_app,close_app,restart_agent,update_agent',
            'managed_app_id' => 'nullable|integer|exists:managed_apps,id',
        ]);

        $payload = null;
        if (! empty($validated['managed_app_id'])) {
            $app = \App\Models\ManagedApp::find($validated['managed_app_id']);
            if ($app && in_array($validated['action'], ['open_app', 'close_app'], true)) {
                $payload = ['exe' => $app->exe, 'launch' => $app->launch, 'name' => $app->name];
            }
        }

        $command = $device->commands()->create(['action' => $validated['action'], 'payload' => $payload]);
        if ($validated['action'] === 'open_app' && ! $payload) {
            $device->update(['app_expected' => true]);
        } elseif ($validated['action'] === 'close_app' && ! $payload) {
            $device->update(['app_expected' => false]);
        }
        $target = $payload['name'] ?? 'app perpus';
        $device->log('command', "Antre: {$command->label()} ({$target})");

        return response()->json(['ok' => true, 'command' => ['id' => $command->id, 'action' => $command->action]]);
    }

    public function cancelCommand(\App\Models\DeviceCommand $command)
    {
        if ($command->status !== 'pending') {
            return response()->json(['message' => 'Perintah sudah diproses agen.'], 422);
        }
        $command->update(['status' => 'failed', 'done_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function handleAlert(Alert $alert)
    {
        $alert->update(['handled' => true]);

        return response()->json(['ok' => true]);
    }

    public function destroy(Device $device)
    {
        $device->delete();

        return response()->json(['ok' => true]);
    }

    public function apps()
    {
        return response()->json([
            'apps' => \App\Models\ManagedApp::orderBy('name')->get()->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'exe' => $a->exe,
                'launch' => $a->launch,
                'auto_reopen' => (bool) $a->auto_reopen,
            ])->values(),
        ]);
    }

    public function storeApp(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'exe' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_.~-]+\.exe$/i'],
            'launch' => 'required|string|max:255',
            'auto_reopen' => 'nullable|boolean',
        ]);

        $app = \App\Models\ManagedApp::create([
            'name' => $validated['name'],
            'exe' => strtolower($validated['exe']),
            'launch' => $validated['launch'],
            'auto_reopen' => (bool) ($validated['auto_reopen'] ?? false),
        ]);

        return response()->json(['ok' => true, 'app' => $app], 201);
    }

    public function updateApp(Request $request, \App\Models\ManagedApp $app)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'exe' => ['sometimes', 'string', 'max:100', 'regex:/^[A-Za-z0-9_.~-]+\.exe$/i'],
            'launch' => 'sometimes|string|max:255',
            'auto_reopen' => 'nullable|boolean',
        ]);

        if (isset($validated['exe'])) {
            $validated['exe'] = strtolower($validated['exe']);
        }
        $app->update($validated);

        return response()->json(['ok' => true]);
    }

    public function destroyApp(\App\Models\ManagedApp $app)
    {
        $app->delete();

        return response()->json(['ok' => true]);
    }
}
