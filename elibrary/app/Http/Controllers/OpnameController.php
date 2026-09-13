<?php

namespace App\Http\Controllers;

use App\Models\Eksemplar;
use App\Models\Lokasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpnameController extends Controller
{
    public function index(Request $request)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;

        $query = Eksemplar::with(['book.lokasiRak'])
            ->whereIn('status', [Eksemplar::TERSEDIA, Eksemplar::HILANG, Eksemplar::RUSAK])
            ->orderBy('kode');

        if ($request->filled('lokasi')) {
            $query->whereHas('book', fn ($q) => $q->where('lokasi', $request->query('lokasi')));
        }

        if ($request->filled('q')) {
            $like = '%' . $request->query('q') . '%';
            $query->where(function ($q) use ($like) {
                $q->where('kode', 'like', $like)
                    ->orWhereHas('book', fn ($b) => $b->where('judul_buku', 'like', $like));
            });
        }

        $items = $query->limit(500)->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'code' => $e->kode,
                'book' => $e->book?->judul_buku ?? '-',
                'location' => $e->book?->lokasiRak?->id_lokasi,
                'status' => $e->status,
            ];
        });

        $borrowedCount = Eksemplar::where('status', Eksemplar::DIPINJAM)->count();

        return Inertia::render('Opname/Index', [
            'items' => $items,
            'locations' => Lokasi::orderBy('id_lokasi')->get()->map(fn ($l) => [
                'id' => $l->id_lokasi,
                'label' => $l->id_lokasi . ' — ' . $l->nama,
            ]),
            'filters' => [
                'lokasi' => $request->query('lokasi', ''),
                'q' => $request->query('q', ''),
            ],
            'borrowedCount' => $borrowedCount,
        ]);
    }

    /**
     * Simpan hasil opname: yang dicentang = ketemu, yang tidak = hilang.
     * Hanya memproses ID dalam lingkup yang ditampilkan (expected).
     */
    public function finish(Request $request)
    {
        if ($deny = $this->ensureCan(['edit_books', 'manage_books'])) return $deny;

        $validated = $request->validate([
            'expected' => 'required|array|min:1',
            'expected.*' => 'integer|exists:tb_eksemplar,id',
            'found' => 'nullable|array',
            'found.*' => 'integer|exists:tb_eksemplar,id',
        ]);

        $expected = $validated['expected'];
        $found = $validated['found'] ?? [];

        $rediscovered = Eksemplar::whereIn('id', $found)
            ->whereIn('id', $expected)
            ->where('status', Eksemplar::HILANG)
            ->update(['status' => Eksemplar::TERSEDIA]);

        $lost = Eksemplar::whereIn('id', $expected)
            ->whereNotIn('id', $found)
            ->where('status', Eksemplar::TERSEDIA)
            ->update(['status' => Eksemplar::HILANG]);

        return redirect()->back()->with(
            'success',
            "Opname selesai: {$rediscovered} ditemukan lagi, {$lost} baru dinyatakan hilang."
        );
    }
}
