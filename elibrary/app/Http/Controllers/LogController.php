<?php

namespace App\Http\Controllers;

use App\Models\LoanLog;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_logs'])) return $deny;

        $logs = LoanLog::with(['book', 'member'])
            ->orderBy('tgl_pinjam', 'desc')
            ->orderBy('id_log', 'desc')
            ->get()
            ->map(function ($l) {
                return [
                    'id' => $l->id_log,
                    'book' => $l->book?->judul_buku ?? '-',
                    'member' => $l->member?->nama ?? '-',
                    'borrow_date' => $l->tgl_pinjam?->format('d/m/Y'),
                    'return_date' => $l->tgl_kembali?->format('d/m/Y'),
                    'done' => $l->tgl_kembali !== null,
                ];
            });

        return Inertia::render('Log/Index', [
            'logs' => $logs,
        ]);
    }
}
