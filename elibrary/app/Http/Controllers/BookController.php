<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Circulation;
use App\Models\EbookFile;
use App\Models\Eksemplar;
use App\Models\Kategori;
use App\Models\Lokasi;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

    /**
     * Daftar kategori untuk dropdown form (opsional).
     */
    private function categoryOptions()
    {
        return Kategori::orderBy('id_kategori')->get()->map(function ($k) {
            return [
                'id' => $k->id_kategori,
                'label' => $k->id_kategori . ' — ' . $k->nama,
            ];
        });
    }

    private function safeOriginalName(string $name): string
    {
        $name = basename(str_replace('\\', '/', $name));
        $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?: '';

        return $name ?: 'ebook.pdf';
    }

    private function ebookPayload(?EbookFile $file): ?array
    {
        if (! $file) {
            return null;
        }

        return [
            'format' => $file->format,
            'original_name' => $file->original_name,
            'mime_type' => $file->mime_type,
            'size_bytes' => $file->size_bytes,
        ];
    }

    private function deleteEbookFile(?EbookFile $file): void
    {
        if (! $file) {
            return;
        }

        Storage::disk('local')->delete($file->stored_name);
        $file->delete();
    }

    private function storeEbookFile(Request $request, Book $book): ?EbookFile
    {
        $existing = $book->ebookFile()->first();

        if ($request->input('jenis') !== 'ebook' || $request->boolean('hapus_ebook')) {
            $this->deleteEbookFile($existing);

            return null;
        }

        if (! $request->hasFile('ebook')) {
            return $existing;
        }

        $file = $request->file('ebook');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'pdf');
        $storedName = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('ebooks/' . $book->id_buku, $storedName, 'local');

        if (! $path) {
            throw new \RuntimeException('File ebook gagal disimpan.');
        }

        $oldStoredName = $existing?->stored_name;
        $ebookFile = EbookFile::updateOrCreate(
            ['id_buku' => $book->id_buku, 'format' => 'pdf'],
            [
                'original_name' => $this->safeOriginalName($file->getClientOriginalName()),
                'stored_name' => $path,
                'mime_type' => $file->getMimeType() ?: 'application/pdf',
                'size_bytes' => $file->getSize(),
            ],
        );

        if ($oldStoredName && $oldStoredName !== $path) {
            Storage::disk('local')->delete($oldStoredName);
        }

        return $ebookFile;
    }

    public function index(Request $request)
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $jenis = $request->route('jenis') ?: $request->query('jenis');
        if (! in_array($jenis, ['buku', 'ebook'], true)) {
            $jenis = null;
        }

        $books = Book::with(['lokasiRak', 'kategoriRef', 'ebookFile'])
            ->when($jenis, fn ($query) => $query->where('jenis', $jenis))
            ->orderBy('judul_buku')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id_buku,
                    'title' => $b->judul_buku,
                    'author' => $b->pengarang,
                    'publisher' => $b->penerbit,
                    'year' => $b->th_terbit,
                    'jenis' => $b->jenis ?: 'buku',
                    'ebook' => $this->ebookPayload($b->ebookFile),
                    'stock' => $b->jumlah,
                    'available' => $b->exemplars()->where('status', Eksemplar::TERSEDIA)->count(),
                    'photo' => static::photoUrl($b->foto),
                    'location' => $b->lokasiRak ? $b->lokasiRak->id_lokasi . ' — ' . $b->lokasiRak->nama : null,
                    'category' => $b->kategoriRef ? $b->kategoriRef->id_kategori . ' — ' . $b->kategoriRef->nama : null,
                ];
            });

        return Inertia::render('Books/Index', [
            'books' => $books,
            'activeJenis' => $jenis,
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
            'categories' => $this->categoryOptions(),
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
            'kategori' => 'nullable|string|max:10|exists:tb_kategori,id_kategori',
            'jenis' => 'required|string|in:buku,ebook',
            'ebook' => 'required_if:jenis,ebook|nullable|file|mimes:pdf|mimetypes:application/pdf|max:51200',
            'hapus_ebook' => 'nullable|boolean',
        ]);

        $stock = $validated['jenis'] === 'ebook' ? 0 : (int) $validated['jumlah'];
        $book = Book::create([
            'id_buku' => $validated['id_buku'],
            'judul_buku' => $validated['judul_buku'],
            'pengarang' => $validated['pengarang'] ?? null,
            'jumlah' => $stock,
            'foto' => $this->storePhoto($request, 'foto', 'foto-buku'),
            'lokasi' => $validated['jenis'] === 'ebook' ? null : ($validated['lokasi'] ?? null),
            'kategori' => $validated['kategori'] ?? null,
            'jenis' => $validated['jenis'],
        ]);

        $this->storeEbookFile($request, $book);

        // Buatkan kartu eksemplar sesuai jumlah.
        for ($i = 1; $i <= $stock; $i++) {
            Eksemplar::create([
                'id_buku' => $validated['id_buku'],
                'kode' => $validated['id_buku'] . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
            ]);
        }

        $this->audit('tambah', 'tb_buku', $validated['id_buku'], "Tambah {$validated['jenis']} {$validated['judul_buku']}");

        $label = $validated['jenis'] === 'ebook' ? 'Ebook' : 'Buku';

        return redirect()->route($label === 'Ebook' ? 'ebooks.index' : 'books.index')
            ->with('success', "{$label} berhasil ditambahkan.");
    }

    public function edit($id)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;
        $book = Book::with('ebookFile')->findOrFail($id);

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
                'category' => $book->kategori,
                'jenis' => $book->jenis ?: 'buku',
                'ebook' => $this->ebookPayload($book->ebookFile),
            ],
            'locations' => $this->locationOptions(),
            'categories' => $this->categoryOptions(),
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
            'kategori' => 'nullable|string|max:10|exists:tb_kategori,id_kategori',
            'jenis' => 'required|string|in:buku,ebook',
            'ebook' => 'nullable|file|mimes:pdf|mimetypes:application/pdf|max:51200',
            'hapus_ebook' => 'nullable|boolean',
        ]);

        $oldId = $book->id_buku;
        $newId = $validated['id_buku'];
        $newTotal = $validated['jenis'] === 'ebook' ? 0 : (int) $validated['jumlah'];

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
            'lokasi' => $validated['jenis'] === 'ebook' ? null : ($validated['lokasi'] ?? null),
            'kategori' => $validated['kategori'] ?? null,
            'jenis' => $validated['jenis'],
        ]);

        $this->storeEbookFile($request, $book);

        // Samakan prefix kode eksemplar bila ID buku berubah.
        if ($newId !== $oldId) {
            foreach (Eksemplar::where('id_buku', $newId)->get() as $copy) {
                $suffix = preg_match('/-(\d+)$/', $copy->kode, $m) ? $m[1] : '01';
                $copy->update(['kode' => $newId . '-' . $suffix]);
            }
        }

        $this->audit('ubah', 'tb_buku', $newId, "Ubah {$validated['jenis']} {$validated['judul_buku']}");

        $label = $validated['jenis'] === 'ebook' ? 'Ebook' : 'Buku';

        return redirect()->route($label === 'Ebook' ? 'ebooks.index' : 'books.index')
            ->with('success', "{$label} berhasil diperbarui.");
    }

    public function show($id)
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $book = Book::with(['lokasiRak', 'kategoriRef', 'ebookFile'])->findOrFail($id);

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
                'category' => $book->kategoriRef ? $book->kategoriRef->id_kategori . ' — ' . $book->kategoriRef->nama : null,
                'jenis' => $book->jenis ?: 'buku',
                'ebook' => $this->ebookPayload($book->ebookFile),
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

    public function preview($id)
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $book = Book::findOrFail($id);

        return Inertia::render('Reader/Preview', [
            'book' => [
                'id' => $book->id_buku,
                'title' => $book->judul_buku,
                'author' => $book->pengarang,
                'photo' => static::photoUrl($book->foto),
            ],
        ]);
    }

    public function read($id)
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $book = Book::with('ebookFile')->findOrFail($id);
        $file = $book->ebookFile;

        abort_unless($file && Storage::disk('local')->exists($file->stored_name), 404);

        return Inertia::render('Reader/Pdf', [
            'book' => [
                'id' => $book->id_buku,
                'title' => $book->judul_buku,
                'author' => $book->pengarang,
            ],
            'assetBaseUrl' => request()->getSchemeAndHttpHost() . '/build/pdfjs',
            'file' => [
                ...$this->ebookPayload($file),
                'url' => route('books.file', $book->id_buku),
            ],
        ]);
    }

    public function file($id)
    {
        if ($deny = $this->ensureCan(['view_books', 'manage_books'])) return $deny;
        $book = Book::with('ebookFile')->findOrFail($id);
        $file = $book->ebookFile;

        abort_unless($file && Storage::disk('local')->exists($file->stored_name), 404);

        return Storage::disk('local')->response(
            $file->stored_name,
            $this->safeOriginalName($file->original_name),
            [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'private, max-age=3600',
            ],
        );
    }

    public function destroy($id)
    {
        if ($deny = $this->ensureCan(['delete_books', 'manage_books'])) return $deny;
        $book = Book::with('ebookFile')->findOrFail($id);

        $active = $book->circulations()->where('status', 'PIN')->count();
        if ($active > 0) {
            return redirect()->back()->with(
                'error',
                "Buku {$book->judul_buku} masih dipinjam {$active} eksemplar. Tunggu kembali dulu sebelum dihapus."
            );
        }

        $this->deletePhoto($book->foto);
        $this->deleteEbookFile($book->ebookFile);
        $book->delete();

        $this->audit('hapus', 'tb_buku', $id, "Hapus buku {$book->judul_buku}");

        return redirect()->route('books.index')
            ->with('success', 'Buku berhasil dihapus.');
    }
}
