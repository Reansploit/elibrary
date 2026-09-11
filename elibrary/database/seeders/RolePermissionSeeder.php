<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_books',
            'create_books',
            'edit_books',
            'delete_books',
            'manage_books',
            'view_members',
            'create_members',
            'edit_members',
            'delete_members',
            'manage_members',
            'view_circulation',
            'borrow_books',
            'return_books',
            'view_dashboard',
            'manage_users',
            'manage_roles',
            'manage_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        $petugasRole = Role::firstOrCreate(['name' => 'Petugas', 'guard_name' => 'web']);
        $petugasRole->syncPermissions([
            'view_dashboard',
            'view_books',
            'borrow_books',
            'return_books',
            'view_members',
            'view_circulation',
            'manage_settings',
        ]);
    }
}
