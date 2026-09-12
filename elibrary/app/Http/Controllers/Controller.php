<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
     */
    protected static function photoUrl(?string $path): ?string
    {
        return $path ? '/storage/' . ltrim($path, '/') : null;
    }

    /**
     * Simpan upload foto baru (opsional): ganti file lama bila ada upload,
     * hapus bila diminta via flag `hapus_foto`. Kembalikan path baru (atau lama).
     */
    protected function storePhoto(Request $request, string $field, string $dir, ?string $old = null): ?string
    {
        if ($request->boolean('hapus_foto')) {
            if ($old) {
                Storage::disk('public')->delete($old);
            }

            return null;
        }

        if ($request->hasFile($field)) {
            if ($old) {
                Storage::disk('public')->delete($old);
            }

            return $request->file($field)->store($dir, 'public');
        }

        return $old;
    }

    /**
     * Hapus file foto dari storage (abaikan bila kosong).
     */
    protected function deletePhoto(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
