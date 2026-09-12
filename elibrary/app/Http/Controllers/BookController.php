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
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $books = Book::orderBy('judul_buku')->get()->map(function ($b) {
            return [
                'id' => $b->id_buku,
                'title' => $b->judul_buku,
                'author' => $b->pengarang,
                'publisher' => $b->penerbit,
                'year' => $b->th_terbit,
                'stock' => $b->jumlah,
                'photo' => static::photoUrl($b->foto),
            ];
        });

        return Inertia::render('Books/Index', [
            'books' => $books,
        ]);
    }

    public function management()
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
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
                    // Positif bila sudah lewat jatuh tempo (today - due).
                    $daysOverdue = $due->diffInDays($today, false);
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
        if ($deny = $this->ensureCan(['create_books', 'manage_books'])) return $deny;
        return Inertia::render('Books/Form', [
            'book' => null,
        ]);
    }

    public function store(Request $request)
    {
        if ($deny = $this->ensureCan(['create_books', 'manage_books'])) return $deny;
        $validated = $request->validate([
            'id_buku' => 'required|string|max:10|unique:tb_buku,id_buku',
            'judul_buku' => 'required|string|max:30',
            'pengarang' => 'nullable|string|max:30',
            'jumlah' => 'required|integer|min:0|max:9999',
            'foto' => 'nullable|image|max:2048',
        ]);

        Book::create([
            'id_buku' => $validated['id_buku'],
            'judul_buku' => $validated['judul_buku'],
            'pengarang' => $validated['pengarang'] ?? null,
            'jumlah' => $validated['jumlah'],
            'foto' => $this->storePhoto($request, 'foto', 'foto-buku'),
        ]);

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil ditambahkan.');
    }

    public function edit($id)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;
        $book = Book::findOrFail($id);

        return Inertia::render('Books/Form', [
            'book' => [
                'id' => $book->id_buku,
                'title' => $book->judul_buku,
                'author' => $book->pengarang,
                'publisher' => $book->penerbit,
                'year' => $book->th_terbit,
                'stock' => $book->jumlah,
                'photo' => static::photoUrl($book->foto),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'id_buku' => 'required|string|max:10|unique:tb_buku,id_buku,' . $id . ',id_buku',
            'judul_buku' => 'required|string|max:30',
            'pengarang' => 'nullable|string|max:30',
            'jumlah' => 'required|integer|min:0|max:9999',
            'foto' => 'nullable|image|max:2048',
        ]);

        // FK sirkulasi & log memakai ON UPDATE CASCADE, jadi ganti ID aman.
        $book->update([
            'id_buku' => $validated['id_buku'],
            'judul_buku' => $validated['judul_buku'],
            'pengarang' => $validated['pengarang'] ?? null,
            'jumlah' => $validated['jumlah'],
            'foto' => $this->storePhoto($request, 'foto', 'foto-buku', $book->foto),
        ]);

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil diperbarui.');
    }

    public function show($id)
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $book = Book::findOrFail($id);

        $activeLoans = Circulation::with('member')
            ->where('id_buku', $book->id_buku)
            ->where('status', 'PIN')
            ->get();
        $activeLoan = $activeLoans->first();
        $stock = max(0, (int) $book->jumlah);

        $history = Circulation::with('member')
            ->where('id_buku', $book->id_buku)
            ->orderBy('tgl_pinjam', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'member' => $c->member?->nama ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y') ?? '-',
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'status' => $c->status,
                ];
            });

        return Inertia::render('Books/Show', [
            'book' => [
                'id' => $book->id_buku,
                'title' => $book->judul_buku,
                'author' => $book->pengarang,
                'stock' => $book->jumlah,
                'photo' => static::photoUrl($book->foto),
                'borrowed' => $activeLoans->isNotEmpty(),
                'remaining' => $stock - $activeLoans->count(),
                'borrower' => $activeLoan?->member?->nama,
                'due' => $activeLoan && $activeLoan->tgl_kembali
                    ? Carbon::parse($activeLoan->tgl_kembali)->format('d/m/Y')
                    : null,
            ],
            'history' => $history,
        ]);
    }

    public function destroy($id)
    {
        if ($deny = $this->ensureCan(['delete_books', 'manage_books'])) return $deny;
        $book = Book::findOrFail($id);
        $this->deletePhoto($book->foto);
        $book->delete();

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil dihapus.');
    }
}
