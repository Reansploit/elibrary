<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Izin baca untuk halaman Log Aktivitas (ikut seeded ke Administrator).
     */
    public function up(): void
    {
        Permission::firstOrCreate(['name' => 'view_logs', 'guard_name' => 'web']);

        $admin = Role::where('name', 'Administrator')->first();
        if ($admin) {
            $admin->givePermissionTo(['view_logs']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Permission::whereIn('name', ['view_logs'])->delete();
    }
};
