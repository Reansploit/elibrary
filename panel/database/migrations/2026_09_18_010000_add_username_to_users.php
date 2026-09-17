<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('username', 50)->unique()->after('name');
            });
        }

        // Isi dari prefix email untuk akun lama.
        foreach (\App\Models\User::whereNull('username')->orWhere('username', '')->get() as $user) {
            $base = strtolower(preg_replace('/[^a-z0-9]+/i', '', explode('@', $user->email ?? '')[0] ?? 'user'));
            $base = $base !== '' ? $base : 'user';
            $name = $base;
            $i = 1;
            while (\App\Models\User::where('username', $name)->where('id', '!=', $user->id)->exists()) {
                $name = $base . $i;
                $i++;
            }
            $user->update(['username' => $name]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
