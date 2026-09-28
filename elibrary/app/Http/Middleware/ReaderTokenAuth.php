<?php

namespace App\Http\Middleware;

use App\Models\ReaderToken;
use Closure;
use Illuminate\Http\Request;

class ReaderTokenAuth
{
    /**
     * Token pembaca portal viewer (header Authorization: Bearer).
     * Anggota dikenali dari kartu RFID saat login, jadi tanpa password:
     * siapa memegang kartu dianggap pemiliknya.
     */
    public function handle(Request $request, Closure $next)
    {
        $plain = ltrim((string) $request->bearerToken());

        if ($plain === '') {
            return response()->json(['message' => 'Perlu masuk dulu.'], 401);
        }

        $token = ReaderToken::where('token_hash', hash('sha256', $plain))->first();

        if (! $token) {
            return response()->json(['message' => 'Sesi tidak dikenal.'], 401);
        }

        $member = \App\Models\Member::find($token->id_anggota);

        if (! $member || ! $member->aktif) {
            $token->delete();

            return response()->json(['message' => 'Akun tidak aktif.'], 401);
        }

        $request->merge(['reader' => $member]);

        return $next($request);
    }
}
