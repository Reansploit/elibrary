<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Member;
use App\Models\Circulation;
use App\Models\LoanLog;
use App\Models\Reservasi;
use App\Models\Setting;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CirculationController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_circulation'])) return $deny;
        $circulations = Circulation::with(['book', 'member'])
            ->orderBy('tgl_pinjam', 'desc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'book_id' => $c->id_buku,
                    'book' => $c->book?->judul_buku ?? '-',
                    'member_id' => $c->id_anggota,
                    'member' => $c->member?->nama ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('Y-m-d'),
                    'return_date' => $c->tgl_kembali?->format('Y-m-d') ?? null,
                    'status' => $c->status,
                ];
            });

        return Inertia::render('Circulation/Index', [
            'circulations' => $circulations,
            'loan_duration' => (int) Setting::get('loan_duration_days', 7),
        ]);
    }

    public function overdue()
    {
        if ($deny = $this->ensureCan(['view_circulation'])) return $deny;
        $today = Carbon::today();
        $todayStr = $today->format('Y-m-d');

        $overdueLoans = Circulation::with(['book', 'member'])
            ->where('status', 'PIN')
            ->where('tgl_kembali', '<', $todayStr)
            ->where('tgl_kembali', '!=', '0000-00-00')
            ->orderBy('tgl_kembali')
            ->get()
            ->map(function ($c) use ($today) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'member' => $c->member?->nama ?? '-',
                    'member_id' => $c->member?->id_anggota ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y'),
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'days_overdue' => Carbon::parse($c->tgl_kembali)->diffInDays($today),
                ];
            });

        $dueSoonLoans = Circulation::with(['book', 'member'])
            ->where('status', 'PIN')
            ->where('tgl_kembali', '>=', $todayStr)
            ->where('tgl_kembali', '<=', $today->copy()->addDays(3)->format('Y-m-d'))
            ->where('tgl_kembali', '!=', '0000-00-00')
            ->orderBy('tgl_kembali')
            ->get()
            ->map(function ($c) use ($today) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'member' => $c->member?->nama ?? '-',
                    'member_id' => $c->member?->id_anggota ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y'),
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'days_until_due' => Carbon::parse($c->tgl_kembali)->diffInDays($today),
                ];
            });

        return Inertia::render('Circulation/Overdue', [
            'overdueLoans' => $overdueLoans,
            'dueSoonLoans' => $dueSoonLoans,
            'loan_duration' => (int) Setting::get('loan_duration_days', 7),
        ]);
    }

    public function create()
    {
        if ($deny = $this->ensureCan(['borrow_books'])) return $deny;
        $books = Book::with('lokasiRak')->orderBy('judul_buku')->get()->map(function ($b) {
            return [
                'id' => $b->id_buku,
                'title' => $b->judul_buku,
                'location' => $b->lokasiRak ? $b->lokasiRak->id_lokasi . ' — ' . $b->lokasiRak->nama : null,
            ];
        });

        $members = Member::orderBy('nama')->get()->map(function ($m) {
            return ['id' => $m->id_anggota, 'name' => $m->nama, 'sanctioned' => $m->isSanctioned()];
        });

        return Inertia::render('Circulation/Borrow', [
            'books' => $books,
            'members' => $members,
            'loan_duration' => (int) Setting::get('loan_duration_days', 7),
        ]);
    }

    public function store(Request $request)
    {
        if ($deny = $this->ensureCan(['borrow_books'])) return $deny;
        $validated = $request->validate([
            'id_buku' => 'required|string|exists:tb_buku,id_buku',
            'id_anggota' => 'required|string|max:50|exists:tb_anggota,id_anggota',
            'tgl_pinjam' => 'required|date',
            'jam_pinjam' => 'nullable|date_format:H:i',
            'tgl_kembali' => 'nullable|date|after_or_equal:tgl_pinjam',
        ]);

        // Check availability: active loans + others' reservations vs stock
        $book = Book::find($validated['id_buku']);
        $stock = (int) ($book->jumlah ?? 0);
        $activeCount = Circulation::where('id_buku', $validated['id_buku'])
            ->where('status', 'PIN')
            ->count();
        $queueOthers = Reservasi::where('id_buku', $validated['id_buku'])
            ->whereIn('status', ['antre', 'siap'])
            ->where('id_anggota', '!=', $validated['id_anggota'])
            ->count();

        if ($stock <= 0 || ($activeCount + $queueOthers) >= $stock) {
            $holder = Reservasi::with('member')
                ->where('id_buku', $validated['id_buku'])
                ->whereIn('status', ['antre', 'siap'])
                ->where('id_anggota', '!=', $validated['id_anggota'])
                ->orderBy('created_at')
                ->first();

            return redirect()->back()->withErrors([
                'id_buku' => $holder
                    ? "Buku ini direservasi oleh {$holder->member?->nama}."
                    : ($stock > 0
                        ? "Semua {$stock} eksemplar buku ini sedang dipinjam."
                        : 'Buku ini sedang tidak tersedia.'),
            ]);
        }

        // Block sanctioned members
        $member = Member::find($validated['id_anggota']);

        if ($member && $member->isSanctioned()) {
            $until = $member->sanksi_sampai
                ? Carbon::parse($member->sanksi_sampai)->format('d/m/Y')
                : null;

            return redirect()->back()->withErrors([
                'id_anggota' => $until
                    ? "Anggota {$member->nama} sedang dibatasi peminjamannya sampai {$until}."
                    : "Anggota {$member->nama} sedang dibatasi peminjamannya.",
            ]);
        }

        // Enforce max active loans per member
        $maxLoans = (int) Setting::get('max_loans_per_member', 3);
        $activeCount = Circulation::where('id_anggota', $validated['id_anggota'])
            ->where('status', 'PIN')
            ->count();

        if ($activeCount >= $maxLoans) {
            return redirect()->back()->withErrors([
                'id_anggota' => "Anggota {$member->nama} sudah mencapai batas {$maxLoans} pinjaman aktif.",
            ]);
        }

        // Generate ID
        $last = Circulation::orderBy('id_sk', 'desc')->first();
        $nextNum = $last ? (int) substr($last->id_sk, 3) + 1 : 1;
        $id_sk = 'SK-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        // Combine date and time
        $tglPinjam = $validated['tgl_pinjam'];
        $jamPinjam = $validated['jam_pinjam'] ?? now()->format('H:i');
        $fullPinjam = $tglPinjam . ' ' . $jamPinjam;

        // Due date = borrow date + loan duration (used by overdue/due-soon lists),
        // atau tanggal yang diisi manual di form.
        $dueDate = $validated['tgl_kembali']
            ?? Carbon::parse($tglPinjam)
                ->addDays((int) Setting::get('loan_duration_days', 7))
                ->format('Y-m-d');

        $circulation = Circulation::create([
            'id_sk' => $id_sk,
            'id_buku' => $validated['id_buku'],
            'id_anggota' => $validated['id_anggota'],
            'tgl_pinjam' => $fullPinjam,
            'tgl_kembali' => $dueDate,
            'status' => 'PIN',
        ]);

        // Borrower held a reservation: mark it fulfilled
        Reservasi::where('id_buku', $validated['id_buku'])
            ->where('id_anggota', $validated['id_anggota'])
            ->whereIn('status', ['antre', 'siap'])
            ->update(['status' => 'selesai']);

        // Log the borrowing
        LoanLog::create([
            'id_buku' => $validated['id_buku'],
            'id_anggota' => $validated['id_anggota'],
            'tgl_pinjam' => $fullPinjam,
        ]);

        return redirect()->route('circulation.index')
            ->with('success', 'Buku berhasil dipinjamkan.');
    }

    public function returnBook($id)
    {
        if ($deny = $this->ensureCan(['return_books'])) return $deny;
        $circulation = Circulation::findOrFail($id);

        if ($circulation->status !== 'PIN') {
            return redirect()->back()->withErrors([
                'msg' => 'Buku ini sudah dikembalikan.',
            ]);
        }

        $circulation->update([
            'status' => 'KEM',
            'tgl_kembali' => now()->format('Y-m-d'),
        ]);

        // Promote oldest waiting reservation to ready
        Reservasi::where('id_buku', $circulation->id_buku)
            ->where('status', 'antre')
            ->orderBy('created_at')
            ->limit(1)
            ->update(['status' => 'siap']);

        // Complete the audit log for this loan
        LoanLog::where('id_buku', $circulation->id_buku)
            ->where('id_anggota', $circulation->id_anggota)
            ->whereNull('tgl_kembali')
            ->orderBy('tgl_pinjam', 'desc')
            ->first()
            ?->update(['tgl_kembali' => now()->format('Y-m-d')]);

        return redirect()->route('circulation.index')
            ->with('success', 'Buku berhasil dikembalikan.');
    }

    public function extend(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['borrow_books'])) return $deny;
        $circulation = Circulation::findOrFail($id);

        if ($circulation->status !== 'PIN') {
            return redirect()->back()->withErrors([
                'msg' => 'Hanya pinjaman aktif yang bisa diperpanjang.',
            ]);
        }

        $validated = $request->validate([
            'hari' => 'required|integer|min:1|max:60',
        ]);

        $circulation->update([
            'tgl_kembali' => Carbon::parse($circulation->tgl_kembali)
                ->addDays($validated['hari'])
                ->format('Y-m-d'),
        ]);

        return redirect()->back()->with('success', 'Jatuh tempo diperpanjang.');
    }
}
