<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Circulation;
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
        ]);
    }

    /**
     * Semua buku, paginasi server 20/halaman.
     */
    public function all()
    {
        $books = Book::orderBy('judul_buku')
            ->paginate(20)
            ->through(fn ($b) => $this->present($b));

        return Inertia::render('Katalog/All', [
            'books' => $books,
        ]);
    }

    /**
     * Pencarian buku publik (JSON). Tanpa data peminjam demi privasi.
     */
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));

        if (mb_strlen($q) < 1) {
            return response()->json(['books' => []]);
        }

        $like = "%{$q}%";

        $books = Book::where('judul_buku', 'like', $like)
            ->orWhere('id_buku', 'like', $like)
            ->orWhere('pengarang', 'like', $like)
            ->orderBy('judul_buku')
            ->limit(12)
            ->get()
            ->map(fn ($b) => $this->present($b));

        return response()->json(['books' => $books]);
    }

    /**
     * Bentuk tampilan publik sebuah buku (tanpa data peminjam).
     */
    private function present(Book $book): array
    {
        $activeCount = Circulation::where('id_buku', $book->id_buku)
            ->where('status', 'PIN')
            ->count();
        $stock = max(0, (int) $book->jumlah);
        $book->loadMissing('lokasiRak');

        return [
            'id' => $book->id_buku,
            'title' => $book->judul_buku,
            'author' => $book->pengarang,
            'stock' => $book->jumlah,
            'photo' => static::photoUrl($book->foto),
            'location' => $book->lokasiRak ? $book->lokasiRak->id_lokasi . ' — ' . $book->lokasiRak->nama : null,
            'remaining' => $stock - $activeCount,
        ];
    }
}
