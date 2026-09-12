<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@elibrary.com',
            'password' => bcrypt('123'),
        ]);

        $adminRole = Role::where('name', 'Administrator')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
}
