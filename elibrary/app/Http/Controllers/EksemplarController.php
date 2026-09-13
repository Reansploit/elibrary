<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Eksemplar;
use Illuminate\Http\Request;

class EksemplarController extends Controller
{
    /**
     * Tambah 1 eksemplar ke buku (nomor urut lanjut otomatis).
     */
    public function store(Request $request, $bookId)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;
        $book = Book::findOrFail($bookId);

        $maxSuffix = 0;
        foreach ($book->exemplars()->pluck('kode') as $kode) {
            if (preg_match('/-(\d+)$/', $kode, $m)) {
                $maxSuffix = max($maxSuffix, (int) $m[1]);
            }
        }

        $copy = Eksemplar::create([
            'id_buku' => $book->id_buku,
            'kode' => $book->id_buku . '-' . str_pad($maxSuffix + 1, 2, '0', STR_PAD_LEFT),
        ]);

        $book->update(['jumlah' => $book->exemplars()->count()]);

        return redirect()->back()->with('success', "Eksemplar {$copy->kode} ditambahkan.");
    }

    /**
     * Ubah status eksemplar (tersedia/hilang/rusak).
     * Yang sedang dipinjam tidak bisa diubah langsung.
     */
    public function update(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;
        $copy = Eksemplar::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:tersedia,hilang,rusak',
        ]);

        if ($copy->status === Eksemplar::DIPINJAM) {
            return redirect()->back()->withErrors([
                'msg' => "Eksemplar {$copy->kode} sedang dipinjam — kembalikan dulu sebelum ubah status.",
            ]);
        }

        $copy->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', "Eksemplar {$copy->kode} ditandai {$validated['status']}.");
    }

    /**
     * Hapus eksemplar yang masih tersedia.
     */
    public function destroy($id)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;
        $copy = Eksemplar::findOrFail($id);

        if ($copy->status !== Eksemplar::TERSEDIA) {
            return redirect()->back()->withErrors([
                'msg' => "Eksemplar {$copy->kode} tidak bisa dihapus karena statusnya {$copy->status}.",
            ]);
        }

        $book = $copy->book;
        $copy->delete();

        if ($book) {
            $book->update(['jumlah' => $book->exemplars()->count()]);
        }

        return redirect()->back()->with('success', "Eksemplar {$copy->kode} dihapus.");
    }
}
