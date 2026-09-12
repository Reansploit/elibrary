<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

abstract class Controller
{
    /**
     * Pastikan user memiliki salah satu permission yang dibutuhkan.
     *
     * Kembalikan null bila lolos; kembalikan RedirectResponse (dengan flash
     * error) bila ditolak. Pola pakai di awal action:
     *
     *     if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
     */
    protected function ensureCan(array $permissions): ?RedirectResponse
    {
        $user = auth()->user();

        if ($user && $user->hasAnyPermission($permissions)) {
            return null;
        }

        $fallback = request()->isMethod('get')
            ? redirect()->route('dashboard')
            : back();

        return $fallback->with('error', 'Anda tidak memiliki izin untuk mengakses fitur ini.');
    }

    /**
     * URL publik untuk file foto (atau null bila tidak ada).
     * Upload baru tinggal di public/, file lama (era symlink storage)
     * tetap dilayani lewat /storage/ bila masih ada di sana.
     */
    protected static function photoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $path = ltrim($path, '/');

        if (is_file(public_path($path))) {
            return '/' . $path;
        }

        return '/storage/' . $path;
    }

    /**
     * Simpan upload foto baru (opsional) langsung di public/ agar tidak
     * bergantung pada symlink storage. Ganti/hapus file lama bila ada.
     * Kembalikan path baru (atau lama).
     */
    protected function storePhoto(Request $request, string $field, string $dir, ?string $old = null): ?string
    {
        $dir = trim($dir, '/');

        if ($request->boolean('hapus_foto')) {
            $this->deletePhoto($old);

            return null;
        }

        if ($request->hasFile($field)) {
            $this->deletePhoto($old);

            $file = $request->file($field);
            $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $name = Str::random(40) . '.' . $ext;

            File::ensureDirectoryExists(public_path($dir));
            $file->move(public_path($dir), $name);

            return $dir . '/' . $name;
        }

        return $old;
    }

    /**
     * Hapus file foto (abaikan bila kosong). Cek lokasi baru dulu,
     * lalu lokasi lama era symlink.
     */
    protected function deletePhoto(?string $path): void
    {
        if (! $path || str_contains($path, '..')) {
            return;
        }

        $path = ltrim($path, '/');

        if (is_file(public_path($path))) {
            @unlink(public_path($path));

            return;
        }

        Storage::disk('public')->delete($path);
    }
}
