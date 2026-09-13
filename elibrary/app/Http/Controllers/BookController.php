<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Circulation;
use App\Models\Eksemplar;
use App\Models\Lokasi;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BookController extends Controller
{
    /**
     * Daftar lokasi untuk dropdown form (id => "KODE — Nama").
     */
    private function locationOptions()
    {
        return Lokasi::orderBy('id_lokasi')->get()->map(function ($l) {
            return [
                'id' => $l->id_lokasi,
                'label' => $l->id_lokasi . ' — ' . $l->nama,
            ];
        });
    }

    public function index()
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $books = Book::with('lokasiRak')->orderBy('judul_buku')->get()->map(function ($b) {
            return [
                'id' => $b->id_buku,
                'title' => $b->judul_buku,
                'author' => $b->pengarang,
                'publisher' => $b->penerbit,
                'year' => $b->th_terbit,
                'stock' => $b->jumlah,
                'available' => $b->exemplars()->where('status', Eksemplar::TERSEDIA)->count(),
                'photo' => static::photoUrl($b->foto),
                'location' => $b->lokasiRak ? $b->lokasiRak->id_lokasi . ' — ' . $b->lokasiRak->nama : null,
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
            'locations' => $this->locationOptions(),
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
            'lokasi' => 'nullable|string|max:10|exists:tb_lokasi,id_lokasi',
        ]);

        Book::create([
            'id_buku' => $validated['id_buku'],
            'judul_buku' => $validated['judul_buku'],
            'pengarang' => $validated['pengarang'] ?? null,
            'jumlah' => $validated['jumlah'],
            'foto' => $this->storePhoto($request, 'foto', 'foto-buku'),
            'lokasi' => $validated['lokasi'] ?? null,
        ]);

        // Buatkan kartu eksemplar sesuai jumlah.
        for ($i = 1; $i <= (int) $validated['jumlah']; $i++) {
            Eksemplar::create([
                'id_buku' => $validated['id_buku'],
                'kode' => $validated['id_buku'] . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
            ]);
        }

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
                'location' => $book->lokasi,
            ],
            'locations' => $this->locationOptions(),
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
            'lokasi' => 'nullable|string|max:10|exists:tb_lokasi,id_lokasi',
        ]);

        $oldId = $book->id_buku;
        $newId = $validated['id_buku'];
        $newTotal = (int) $validated['jumlah'];

        // Sinkron kartu eksemplar dengan jumlah baru.
        $currentTotal = $book->exemplars()->count();
        if ($newTotal > $currentTotal) {
            $maxSuffix = 0;
            foreach ($book->exemplars()->pluck('kode') as $kode) {
                if (preg_match('/-(\d+)$/', $kode, $m)) {
                    $maxSuffix = max($maxSuffix, (int) $m[1]);
                }
            }
            for ($i = $currentTotal + 1; $i <= $newTotal; $i++) {
                $maxSuffix++;
                Eksemplar::create([
                    'id_buku' => $oldId,
                    'kode' => $oldId . '-' . str_pad($maxSuffix, 2, '0', STR_PAD_LEFT),
                ]);
            }
        } elseif ($newTotal < $currentTotal) {
            $removable = $book->exemplars()
                ->where('status', Eksemplar::TERSEDIA)
                ->orderBy('kode', 'desc')
                ->take($currentTotal - $newTotal)
                ->get();
            if ($removable->count() < ($currentTotal - $newTotal)) {
                return redirect()->back()->withErrors([
                    'jumlah' => 'Tidak bisa dikurangi: sebagian eksemplar sedang dipinjam, hilang, atau rusak.',
                ]);
            }
            foreach ($removable as $copy) {
                $copy->delete();
            }
        }

        // FK sirkulasi & log memakai ON UPDATE CASCADE, jadi ganti ID aman.
        $book->update([
            'id_buku' => $newId,
            'judul_buku' => $validated['judul_buku'],
            'pengarang' => $validated['pengarang'] ?? null,
            'jumlah' => $newTotal,
            'foto' => $this->storePhoto($request, 'foto', 'foto-buku', $book->foto),
            'lokasi' => $validated['lokasi'] ?? null,
        ]);

        // Samakan prefix kode eksemplar bila ID buku berubah.
        if ($newId !== $oldId) {
            foreach (Eksemplar::where('id_buku', $newId)->get() as $copy) {
                $suffix = preg_match('/-(\d+)$/', $copy->kode, $m) ? $m[1] : '01';
                $copy->update(['kode' => $newId . '-' . $suffix]);
            }
        }

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

        $history = Circulation::with(['member', 'exemplar'])
            ->where('id_buku', $book->id_buku)
            ->orderBy('tgl_pinjam', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'member' => $c->member?->nama ?? '-',
                    'exemplar' => $c->exemplar?->kode,
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y') ?? '-',
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'status' => $c->status,
                ];
            });

        $exemplars = $book->exemplars()->orderBy('kode')->get()->map(function ($e) {
            $borrower = null;
            if ($e->status === Eksemplar::DIPINJAM) {
                $loan = $e->circulations()->where('status', 'PIN')->with('member')->first();
                $borrower = $loan?->member?->nama;
            }

            return [
                'id' => $e->id,
                'code' => $e->kode,
                'status' => $e->status,
                'borrower' => $borrower,
            ];
        });

        return Inertia::render('Books/Show', [
            'book' => [
                'id' => $book->id_buku,
                'title' => $book->judul_buku,
                'author' => $book->pengarang,
                'stock' => $book->jumlah,
                'photo' => static::photoUrl($book->foto),
                'location' => $book->lokasiRak ? $book->lokasiRak->id_lokasi . ' — ' . $book->lokasiRak->nama : null,
                'borrowed' => $activeLoans->isNotEmpty(),
                'remaining' => $stock - $activeLoans->count(),
                'borrower' => $activeLoan?->member?->nama,
                'due' => $activeLoan && $activeLoan->tgl_kembali
                    ? Carbon::parse($activeLoan->tgl_kembali)->format('d/m/Y')
                    : null,
            ],
            'history' => $history,
            'exemplars' => $exemplars,
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
