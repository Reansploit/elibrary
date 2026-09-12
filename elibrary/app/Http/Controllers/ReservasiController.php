<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Member;
use App\Models\Reservasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservasiController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_reservations', 'manage_reservations'])) return $deny;

        $reservations = Reservasi::with(['book', 'member'])
            ->orderBy('created_at')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'book' => $r->book?->judul_buku ?? '-',
                    'book_id' => $r->id_buku,
                    'member' => $r->member?->nama ?? '-',
                    'status' => $r->status,
                    'date' => $r->created_at?->format('d/m/Y'),
                ];
            });

        $books = Book::orderBy('judul_buku')->get()->map(function ($b) {
            return ['id' => $b->id_buku, 'title' => $b->judul_buku];
        });

        $members = Member::orderBy('nama')->get()->map(function ($m) {
            return ['id' => $m->id_anggota, 'name' => $m->nama];
        });

        return Inertia::render('Reservasi/Index', [
            'reservations' => $reservations,
            'books' => $books,
            'members' => $members,
        ]);
    }

    public function store(Request $request)
    {
        if ($deny = $this->ensureCan(['manage_reservations'])) return $deny;

        $validated = $request->validate([
            'id_buku' => 'required|string|exists:tb_buku,id_buku',
            'id_anggota' => 'required|string|max:50|exists:tb_anggota,id_anggota',
        ]);

        $exists = Reservasi::where('id_buku', $validated['id_buku'])
            ->where('id_anggota', $validated['id_anggota'])
            ->whereIn('status', ['antre', 'siap'])
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'id_buku' => 'Anggota ini sudah antre untuk buku tersebut.',
            ]);
        }

        Reservasi::create([
            'id_buku' => $validated['id_buku'],
            'id_anggota' => $validated['id_anggota'],
            'status' => 'antre',
        ]);

        return redirect()->back()->with('success', 'Reservasi berhasil ditambahkan.');
    }

    public function batal($id)
    {
        if ($deny = $this->ensureCan(['manage_reservations'])) return $deny;
        $reservation = Reservasi::findOrFail($id);

        $reservation->update(['status' => 'batal']);

        return redirect()->back()->with('success', 'Reservasi dibatalkan.');
    }

    public function selesai($id)
    {
        if ($deny = $this->ensureCan(['manage_reservations'])) return $deny;
        $reservation = Reservasi::findOrFail($id);

        $reservation->update(['status' => 'selesai']);

        return redirect()->back()->with('success', 'Reservasi ditandai selesai.');
    }
}
