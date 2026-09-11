<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Circulation;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::orderBy('judul_buku')->get()->map(function ($b) {
            return [
                'id' => $b->id_buku,
                'title' => $b->judul_buku,
                'author' => $b->pengarang,
                'publisher' => $b->penerbit,
                'year' => $b->th_terbit,
            ];
        });

        return Inertia::render('Books/Index', [
            'books' => $books,
        ]);
    }

    public function management()
    {
        $today = Carbon::today();
        $books = Book::with(['circulations' => function ($q) {
            $q->where('status', 'PIN')->with('member');
        }])->orderBy('judul_buku')->get()->map(function ($b) use ($today) {
            $activeLoan = $b->circulations->first();
            $status = 'Tersedia';
            $statusClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
            $borrower = '-';
            $dueDate = '-';
            $daysOverdue = 0;

            if ($activeLoan) {
                $status = 'Dipinjam';
                $statusClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
                $borrower = $activeLoan->member?->nama ?? '-';
                $dueDate = $activeLoan->tgl_kembali && $activeLoan->tgl_kembali !== '0000-00-00' 
                    ? Carbon::parse($activeLoan->tgl_kembali)->format('d/m/Y') 
                    : '-';
                
                if ($activeLoan->tgl_kembali && $activeLoan->tgl_kembali !== '0000-00-00') {
                    $due = Carbon::parse($activeLoan->tgl_kembali);
                    $daysOverdue = $today->diffInDays($due, false);
                    if ($daysOverdue > 0) {
                        $status = "Terlambat {$daysOverdue} hari";
                        $statusClass = 'bg-destructive/15 text-destructive dark:text-destructive/80';
                    }
                }
            }

            return [
                'id' => $b->id_buku,
                'title' => $b->judul_buku,
                'author' => $b->pengarang,
                'publisher' => $b->penerbit,
                'year' => $b->th_terbit,
                'status' => $status,
                'statusClass' => $statusClass,
                'borrower' => $borrower,
                'dueDate' => $dueDate,
                'daysOverdue' => $daysOverdue,
                'isBorrowed' => !!$activeLoan,
            ];
        });

        // Stats
        $stats = [
            'total' => $books->count(),
            'available' => $books->where('status', 'Tersedia')->count(),
            'borrowed' => $books->where('status', 'Dipinjam')->count(),
            'overdue' => $books->filter(fn($b) => $b['daysOverdue'] > 0)->count(),
        ];

        return Inertia::render('Books/Management', [
            'books' => $books,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('Books/Form', [
            'book' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_buku' => 'required|string|max:10|unique:tb_buku,id_buku',
            'judul_buku' => 'required|string|max:30',
            'pengarang' => 'required|string|max:30',
            'penerbit' => 'required|string|max:30',
            'th_terbit' => 'required|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        Book::create($validated);

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $book = Book::findOrFail($id);

        return Inertia::render('Books/Form', [
            'book' => [
                'id' => $book->id_buku,
                'title' => $book->judul_buku,
                'author' => $book->pengarang,
                'publisher' => $book->penerbit,
                'year' => $book->th_terbit,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'judul_buku' => 'required|string|max:30',
            'pengarang' => 'required|string|max:30',
            'penerbit' => 'required|string|max:30',
            'th_terbit' => 'required|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        $book->update($validated);

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);
        $book->delete();

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil dihapus.');
    }
}
