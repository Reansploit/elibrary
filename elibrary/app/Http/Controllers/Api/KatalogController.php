<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Eksemplar;
use App\Models\Kategori;
use App\Models\ReaderVote;
use App\Models\Setting;
use Illuminate\Http\Request;

class KatalogController extends Controller
{
    /**
     * Ringkasan katalog publik untuk portal viewer:
     * koleksi terbaru + total + kategori + nama perpus.
     */
    public function index()
    {
        $featured = Book::whereNull('file_ebook')
            ->orderByDesc('id_buku')
            ->limit(20)
            ->get()
            ->map(fn ($b) => $this->present($b));

        return response()->json([
            'library' => Setting::get('library_name', config('app.name', 'Perpustakaan WBS')),
            'featured' => $featured,
            'total' => Book::whereNull('file_ebook')->count(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    /**
     * Semua buku, paginasi 20/halaman + saring kategori + kata kunci.
     * digital=1 hanya yang ada berkas (jalur Baca), =0 hanya fisik (jalur Katalog).
     */
    public function all(Request $request)
    {
        $kategori = trim($request->query('kategori', ''));
        $q = trim($request->query('q', ''));
        $digital = $request->query('digital', '');

        $books = Book::when($kategori !== '', fn ($query) => $query->where('kategori', $kategori))
            ->when($digital === '1', fn ($query) => $query->whereNotNull('file_ebook'))
            ->when($digital === '0', fn ($query) => $query->whereNull('file_ebook'))
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

        return response()->json($books);
    }

    /**
     * Pencarian cepat publik (maks 12). Tanpa data peminjam demi privasi.
     */
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));
        $kategori = trim($request->query('kategori', ''));
        $digital = $request->query('digital', '');

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
            ->when($digital === '1', fn ($w) => $w->whereNotNull('file_ebook'))
            ->when($digital === '0', fn ($w) => $w->whereNull('file_ebook'))
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
     * URL foto absolut karena dipakai lintas origin oleh portal viewer.
     */
    private function present(Book $book): array
    {
        $remaining = $book->exemplars()->where('status', Eksemplar::TERSEDIA)->count();
        $book->loadMissing(['lokasiRak', 'kategoriRef']);
        $photo = static::photoUrl($book->foto);
        $file = static::photoUrl($book->file_ebook);

        return [
            'id' => $book->id_buku,
            'title' => $book->judul_buku,
            'author' => $book->pengarang,
            'stock' => $book->jumlah,
            'photo' => $photo ? url($photo) : null,
            'file' => $file ? url($file) : null,
            'location' => $book->lokasiRak ? $book->lokasiRak->id_lokasi . ' - ' . $book->lokasiRak->nama : null,
            'category' => $book->kategoriRef?->nama,
            'remaining' => $remaining,
            'likes' => ReaderVote::where('id_buku', $book->id_buku)->where('vote', 1)->count(),
            'dislikes' => ReaderVote::where('id_buku', $book->id_buku)->where('vote', -1)->count(),
        ];
    }
}
