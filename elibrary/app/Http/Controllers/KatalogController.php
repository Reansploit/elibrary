<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Eksemplar;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KatalogController extends Controller
{
    /**
     * Halaman katalog publik (tanpa login).
     */
    public function index()
    {
        $featured = Book::orderByDesc('id_buku')
            ->limit(20)
            ->get()
            ->map(fn ($b) => $this->present($b));

        return Inertia::render('Katalog/Index', [
            'featured' => $featured,
            'total' => Book::count(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    /**
     * Semua buku, paginasi server 20/halaman + saring kategori.
     */
    public function all(Request $request)
    {
        $kategori = trim($request->query('kategori', ''));
        $q = trim($request->query('q', ''));

        $books = Book::when($kategori !== '', fn ($query) => $query->where('kategori', $kategori))
            ->when(mb_strlen($q) >= 1, function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($w) use ($like) {
                    $w->where('judul_buku', 'like', $like)
                        ->orWhere('id_buku', 'like', $like)
                        ->orWhere('pengarang', 'like', $like);
                });
            })
            ->orderBy('judul_buku')
            ->paginate(20)
            ->through(fn ($b) => $this->present($b));

        return Inertia::render('Katalog/All', [
            'books' => $books,
            'categories' => $this->categoryOptions(),
            'activeCategory' => $kategori,
            'q' => $q,
        ]);
    }

    /**
     * Pencarian buku publik (JSON). Tanpa data peminjam demi privasi.
     */
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));
        $kategori = trim($request->query('kategori', ''));

        if (mb_strlen($q) < 1) {
            return response()->json(['books' => []]);
        }

        $like = "%{$q}%";

        $books = Book::where(function ($w) use ($like) {
                $w->where('judul_buku', 'like', $like)
                    ->orWhere('id_buku', 'like', $like)
                    ->orWhere('pengarang', 'like', $like);
            })
            ->when($kategori !== '', fn ($w) => $w->where('kategori', $kategori))
            ->orderBy('judul_buku')
            ->limit(12)
            ->get()
            ->map(fn ($b) => $this->present($b));

        return response()->json(['books' => $books]);
    }

    private function categoryOptions(): array
    {
        return Kategori::orderBy('nama')->get()->map(fn ($k) => [
            'id' => $k->id_kategori,
            'name' => $k->nama,
        ])->toArray();
    }

    /**
     * Bentuk tampilan publik sebuah buku (tanpa data peminjam).
     */
    private function present(Book $book): array
    {
        $remaining = $book->exemplars()->where('status', Eksemplar::TERSEDIA)->count();
        $book->loadMissing(['lokasiRak', 'kategoriRef']);

        return [
            'id' => $book->id_buku,
            'title' => $book->judul_buku,
            'author' => $book->pengarang,
            'stock' => $book->jumlah,
            'photo' => static::photoUrl($book->foto),
            'location' => $book->lokasiRak ? $book->lokasiRak->id_lokasi . ' — ' . $book->lokasiRak->nama : null,
            'category' => $book->kategoriRef?->nama,
            'remaining' => $remaining,
        ];
    }
}
