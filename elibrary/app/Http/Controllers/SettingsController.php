<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = [
            'loan' => [
                'max_loans_per_member' => Setting::get('max_loans_per_member', 3),
                'loan_duration_days' => Setting::get('loan_duration_days', 7),
            ],
            'penalty' => [
                'late_penalty_days' => Setting::get('late_penalty_days', 3),
                'penalty_enabled' => Setting::get('penalty_enabled', true),
            ],
            'general' => [
                'library_name' => Setting::get('library_name', 'E-Library'),
            ],
        ];

        $users = User::with('roles')->orderBy('name')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'roles' => $u->roles->pluck('name')->toArray(),
                'role' => $u->roles->pluck('name')->first() ?? 'Petugas',
            ];
        });

        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ];
        });

        $permissions = Permission::pluck('name')->toArray();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'max_loans_per_member' => 'required|integer|min:1|max:50',
            'loan_duration_days' => 'required|integer|min:1|max:365',
            'late_penalty_days' => 'required|integer|min:0|max:365',
            'penalty_enabled' => 'boolean',
            'library_name' => 'required|string|max:100',
        ]);

        Setting::set('max_loans_per_member', $validated['max_loans_per_member'], 'integer', 'loan', 'Maks Pinjam per Anggota', 'Maksimal jumlah buku yang bisa dipinjam per anggota sekaligus');
        Setting::set('loan_duration_days', $validated['loan_duration_days'], 'integer', 'loan', 'Lama Pinjam (Hari)', 'Jumlah hari buku bisa dipinjam sebelum harus dikembalikan');
        Setting::set('late_penalty_days', $validated['late_penalty_days'], 'integer', 'penalty', 'Sanksi Keterlambatan (Hari)', 'Jumlah hari tidak boleh meminjam setelah keterlambatan pengembalian');
        Setting::set('penalty_enabled', $validated['penalty_enabled'] ?? false, 'boolean', 'penalty', 'Aktifkan Sanksi', 'Aktifkan sistem sanksi keterlambatan');
        Setting::set('library_name', $validated['library_name'], 'string', 'general', 'Nama Perpustakaan', 'Nama yang ditampilkan di aplikasi');

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (Role::where('name', $validated['role'])->exists()) {
            $user->assignRole($validated['role']);
        }

        return redirect()->back()->with('success', 'Akun berhasil ditambahkan.');
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|string',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (Role::where('name', $validated['role'])->exists()) {
            $user->syncRoles([$validated['role']]);
        }

        return redirect()->back()->with('success', 'Akun berhasil diperbarui.');
    }

    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'Akun berhasil dihapus.');
    }

    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function updateRole(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $validated['name']]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroyRole($id)
    {
        $role = Role::findOrFail($id);

        if (in_array($role->name, ['Administrator', 'Petugas'])) {
            return redirect()->back()->with('error', 'Role sistem tidak dapat dihapus.');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role berhasil dihapus.');
    }
}
