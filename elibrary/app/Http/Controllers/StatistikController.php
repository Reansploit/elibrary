<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StatistikController extends Controller
{
    /**
     * Statistik bacaan digital petugas: paling dibaca, paling disuka,
     * pembaca aktif. Sumber: data akun viewer (reader_*).
     */
    public function index()
    {
        if ($deny = $this->ensureCan(['view_reports'])) return $deny;

        $read = DB::table('reader_history as h')
            ->join('tb_buku as b', 'b.id_buku', '=', 'h.id_buku')
            ->select('h.id_buku', 'b.judul_buku', DB::raw('COUNT(*) as dibuka'))
            ->groupBy('h.id_buku', 'b.judul_buku')
            ->orderByDesc('dibuka')
            ->limit(10)
            ->get();

        $liked = DB::table('reader_votes as v')
            ->join('tb_buku as b', 'b.id_buku', '=', 'v.id_buku')
            ->select(
                'v.id_buku',
                'b.judul_buku',
                DB::raw("SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END) as suka"),
                DB::raw("SUM(CASE WHEN v.vote = -1 THEN 1 ELSE 0 END) as tidak")
            )
            ->groupBy('v.id_buku', 'b.judul_buku')
            ->orderByDesc('suka')
            ->limit(10)
            ->get();

        $readers = DB::table('reader_history as h')
            ->join('tb_anggota as a', 'a.id_anggota', '=', 'h.id_anggota')
            ->select('h.id_anggota', 'a.nama', 'a.kelas', DB::raw('COUNT(*) as buka'))
            ->groupBy('h.id_anggota', 'a.nama', 'a.kelas')
            ->orderByDesc('buka')
            ->limit(10)
            ->get();

        return Inertia::render('Statistik/Index', [
            'read' => $read,
            'liked' => $liked,
            'readers' => $readers,
            'totals' => [
                'buka' => DB::table('reader_history')->count(),
                'pembaca' => DB::table('reader_history')->distinct('id_anggota')->count('id_anggota'),
                'suara' => DB::table('reader_votes')->count(),
                'catatan' => DB::table('reader_notes')->count(),
            ],
        ]);
    }
}
