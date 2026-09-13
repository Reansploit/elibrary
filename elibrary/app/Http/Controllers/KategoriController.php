<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KategoriController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;

        $categories = Kategori::withCount('books')
            ->orderBy('id_kategori')
            ->get()
            ->map(function ($k) {
                return [
                    'id' => $k->id_kategori,
                    'name' => $k->nama,
                    'description' => $k->keterangan,
                    'books_count' => $k->books_count,
                ];
            });

        return Inertia::render('Kategori/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;

        return Inertia::render('Kategori/Form', [
            'category' => null,
        ]);
    }

    public function store(Request $request)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;

        $validated = $request->validate([
            'id_kategori' => 'required|string|max:10|unique:tb_kategori,id_kategori',
            'nama' => 'required|string|max:50',
            'keterangan' => 'nullable|string|max:100',
        ]);

        Kategori::create([
            'id_kategori' => $validated['id_kategori'],
            'nama' => $validated['nama'],
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        return redirect()->route('kategori.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit($id)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;
        $category = Kategori::findOrFail($id);

        return Inertia::render('Kategori/Form', [
            'category' => [
                'id' => $category->id_kategori,
                'name' => $category->nama,
                'description' => $category->keterangan,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;
        $category = Kategori::findOrFail($id);

        $validated = $request->validate([
            'id_kategori' => 'required|string|max:10|unique:tb_kategori,id_kategori,' . $id . ',id_kategori',
            'nama' => 'required|string|max:50',
            'keterangan' => 'nullable|string|max:100',
        ]);

        // FK memakai ON UPDATE CASCADE, jadi ganti kode aman.
        $category->update([
            'id_kategori' => $validated['id_kategori'],
            'nama' => $validated['nama'],
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        return redirect()->route('kategori.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy($id)
    {
        if ($deny = $this->ensureCan(['manage_books'])) return $deny;
        $category = Kategori::findOrFail($id);

        $used = $category->books()->count();
        if ($used > 0) {
            return redirect()->back()->with(
                'error',
                "Kategori masih dipakai {$used} buku. Pindahkan bukunya dulu."
            );
        }

        $category->delete();

        return redirect()->route('kategori.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
