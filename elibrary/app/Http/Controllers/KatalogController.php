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
        return Inertia::render('Katalog/Index');
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
            ->map(function ($b) {
                $activeCount = Circulation::where('id_buku', $b->id_buku)
                    ->where('status', 'PIN')
                    ->count();
                $stock = max(0, (int) $b->jumlah);

                return [
                    'id' => $b->id_buku,
                    'title' => $b->judul_buku,
                    'author' => $b->pengarang,
                    'stock' => $b->jumlah,
                    'photo' => static::photoUrl($b->foto),
                    'remaining' => $stock - $activeCount,
                ];
            });

        return response()->json(['books' => $books]);
    }
}
