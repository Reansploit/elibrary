<?php

namespace App\Http\Middleware;

use App\Models\Device;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeviceToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $mac = strtolower(trim((string) $request->input('mac', '')));

        if (! $token || $mac === '') {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $device = Device::where('mac', $mac)->first();

        if (! $device || ! hash_equals($device->token_hash, hash('sha256', $token))) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $request->attributes->set('device', $device);

        return $next($request);
    }
}
