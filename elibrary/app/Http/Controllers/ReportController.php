<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Circulation;
use App\Models\Eksemplar;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public const TYPES = ['sirkulasi', 'koleksi', 'anggota'];

    public function index(Request $request)
    {
        if ($deny = $this->ensureCan(['view_reports'])) return $deny;

        $filters = $this->filters($request);
        $payload = $this->build($filters);

        return Inertia::render('Laporan/Index', [
            'filters' => $filters,
            'columns' => $payload['columns'],
            'rows' => $payload['rows'],
            'summary' => $payload['summary'],
            'generatedAt' => now()->format('d/m/Y H:i'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        if ($deny = $this->ensureCan(['view_reports'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses fitur ini.');
        }

        $filters = $this->filters($request);
        $payload = $this->build($filters);

        $filename = "laporan-{$filters['type']}-{$filters['dari']}_{$filters['sampai']}.csv";

        return response()->streamDownload(function () use ($payload) {
            $out = fopen('php://output', 'w');
            // BOM agar rapi dibuka di Excel.
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $payload['columns']);
            foreach ($payload['rows'] as $row) {
                fputcsv($out, array_values($row));
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function filters(Request $request): array
    {
        $type = in_array($request->query('type'), self::TYPES, true)
            ? $request->query('type')
            : 'sirkulasi';

        $dari = $this->cleanDate($request->query('dari')) ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $sampai = $this->cleanDate($request->query('sampai')) ?? Carbon::now()->format('Y-m-d');

        if ($dari > $sampai) {
            [$dari, $sampai] = [$sampai, $dari];
        }

        return ['type' => $type, 'dari' => $dari, 'sampai' => $sampai];
    }

    private function cleanDate(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function build(array $filters): array
    {
        return match ($filters['type']) {
            'koleksi' => $this->collectionReport(),
            'anggota' => $this->memberReport(),
            default => $this->circulationReport($filters),
        };
    }

    private function circulationReport(array $filters): array
    {
        $today = Carbon::today();

        $rows = Circulation::with(['book', 'member', 'exemplar'])
            ->whereDate('tgl_pinjam', '>=', $filters['dari'])
            ->whereDate('tgl_pinjam', '<=', $filters['sampai'])
            ->orderBy('tgl_pinjam')
            ->orderBy('id_sk')
            ->get()
            ->map(function ($c) use ($today) {
                $rawDue = $c->getAttributes()['tgl_kembali'] ?? null;
                $hasDue = $rawDue && $rawDue !== '0000-00-00';
                $dueStr = $today->format('Y-m-d');

                $status = $c->status === 'PIN' ? 'Dipinjam' : 'Kembali';
                if ($c->status === 'PIN' && $hasDue && $rawDue < $dueStr) {
                    $status = 'Terlambat ' . Carbon::parse($rawDue)->diffInDays($today) . ' hari';
                }

                return [
                    'Tgl pinjam' => $c->tgl_pinjam?->format('d/m/Y') ?? '-',
                    'ID' => $c->id_sk,
                    'Buku' => $c->book?->judul_buku ?? '-',
                    'Eksemplar' => $c->exemplar?->kode ?? '-',
                    'Anggota' => $c->member?->nama ?? '-',
                    'Jatuh tempo' => $hasDue ? Carbon::parse($rawDue)->format('d/m/Y') : '-',
                    'Status' => $status,
                ];
            })
            ->values()
            ->toArray();

        return [
            'columns' => ['Tgl pinjam', 'ID', 'Buku', 'Eksemplar', 'Anggota', 'Jatuh tempo', 'Status'],
            'rows' => $rows,
            'summary' => [
                ['label' => 'Total transaksi', 'value' => count($rows)],
                ['label' => 'Masih dipinjam', 'value' => collect($rows)->where('Status', 'Dipinjam')->count()
                    + collect($rows)->filter(fn ($r) => str_starts_with($r['Status'], 'Terlambat'))->count()],
                ['label' => 'Sudah kembali', 'value' => collect($rows)->where('Status', 'Kembali')->count()],
            ],
        ];
    }

    private function collectionReport(): array
    {
        $rows = Book::with('lokasiRak')->orderBy('judul_buku')->get()->map(function ($b) {
            $counts = $b->exemplars()->selectRaw('status, COUNT(*) as jml')->groupBy('status')->pluck('jml', 'status');

            return [
                'ID' => $b->id_buku,
                'Judul' => $b->judul_buku,
                'Pengarang' => $b->pengarang ?? '-',
                'Lokasi' => $b->lokasiRak ? $b->lokasiRak->id_lokasi . ' — ' . $b->lokasiRak->nama : '-',
                'Total' => (int) $b->jumlah,
                'Tersedia' => (int) ($counts[Eksemplar::TERSEDIA] ?? 0),
                'Dipinjam' => (int) ($counts[Eksemplar::DIPINJAM] ?? 0),
                'Hilang' => (int) ($counts[Eksemplar::HILANG] ?? 0),
                'Rusak' => (int) ($counts[Eksemplar::RUSAK] ?? 0),
            ];
        })->values()->toArray();

        return [
            'columns' => ['ID', 'Judul', 'Pengarang', 'Lokasi', 'Total', 'Tersedia', 'Dipinjam', 'Hilang', 'Rusak'],
            'rows' => $rows,
            'summary' => [
                ['label' => 'Judul buku', 'value' => count($rows)],
                ['label' => 'Total eksemplar', 'value' => collect($rows)->sum('Total')],
                ['label' => 'Hilang + rusak', 'value' => collect($rows)->sum('Hilang') + collect($rows)->sum('Rusak')],
            ],
        ];
    }

    private function memberReport(): array
    {
        $rows = Member::orderBy('nama')->get()->map(function ($m) {
            $active = $m->circulations()->where('status', 'PIN')->count();
            $total = $m->circulations()->count();

            return [
                'RFID' => $m->id_anggota,
                'Nama' => $m->nama,
                'Kelas' => $m->kelas ?? '-',
                'Pinjaman aktif' => $active,
                'Total pinjam' => $total,
                'Status' => $m->isSanctioned() ? 'Dibatasi' : 'Bebas',
            ];
        })->values()->toArray();

        return [
            'columns' => ['RFID', 'Nama', 'Kelas', 'Pinjaman aktif', 'Total pinjam', 'Status'],
            'rows' => $rows,
            'summary' => [
                ['label' => 'Total anggota', 'value' => count($rows)],
                ['label' => 'Sedang meminjam', 'value' => collect($rows)->where('Pinjaman aktif', '>', 0)->count()],
                ['label' => 'Dibatasi', 'value' => collect($rows)->where('Status', 'Dibatasi')->count()],
            ],
        ];
    }
}
