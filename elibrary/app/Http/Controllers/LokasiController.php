<?php

namespace App\Http\Controllers;

use App\Models\Lokasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LokasiController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;

        $locations = Lokasi::withCount('books')
            ->orderBy('id_lokasi')
            ->get()
            ->map(function ($l) {
                return [
                    'id' => $l->id_lokasi,
                    'name' => $l->nama,
                    'description' => $l->keterangan,
                    'books_count' => $l->books_count,
                ];
            });

        return Inertia::render('Lokasi/Index', [
            'locations' => $locations,
        ]);
    }

    public function create()
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;

        return Inertia::render('Lokasi/Form', [
            'location' => null,
        ]);
    }

    public function store(Request $request)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;

        $validated = $request->validate([
            'id_lokasi' => 'required|string|max:10|unique:tb_lokasi,id_lokasi',
            'nama' => 'required|string|max:50',
            'keterangan' => 'nullable|string|max:100',
        ]);

        Lokasi::create([
            'id_lokasi' => $validated['id_lokasi'],
            'nama' => $validated['nama'],
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        return redirect()->route('lokasi.index')
            ->with('success', 'Lokasi berhasil ditambahkan.');
    }

    public function edit($id)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;
        $location = Lokasi::findOrFail($id);

        return Inertia::render('Lokasi/Form', [
            'location' => [
                'id' => $location->id_lokasi,
                'name' => $location->nama,
                'description' => $location->keterangan,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;
        $location = Lokasi::findOrFail($id);

        $validated = $request->validate([
            'id_lokasi' => 'required|string|max:10|unique:tb_lokasi,id_lokasi,' . $id . ',id_lokasi',
            'nama' => 'required|string|max:50',
            'keterangan' => 'nullable|string|max:100',
        ]);

        // FK memakai ON UPDATE CASCADE, jadi ganti kode aman.
        $location->update([
            'id_lokasi' => $validated['id_lokasi'],
            'nama' => $validated['nama'],
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        return redirect()->route('lokasi.index')
            ->with('success', 'Lokasi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;
        $location = Lokasi::findOrFail($id);

        $used = $location->books()->count();
        if ($used > 0) {
            return redirect()->back()->with(
                'error',
                "Lokasi masih dipakai {$used} buku. Pindahkan bukunya dulu."
            );
        }

        $location->delete();

        return redirect()->route('lokasi.index')
            ->with('success', 'Lokasi berhasil dihapus.');
    }
}
