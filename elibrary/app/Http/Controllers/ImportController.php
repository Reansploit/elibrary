<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Eksemplar;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    private const TYPES = [
        'buku' => [
            'columns' => ['id_buku', 'judul_buku', 'pengarang', 'jumlah', 'lokasi'],
            'required' => ['id_buku', 'judul_buku'],
            'permissions' => ['create_books', 'manage_books'],
            'title' => 'Buku',
        ],
        'anggota' => [
            'columns' => ['id_anggota', 'nama', 'jekel', 'kelas'],
            'required' => ['id_anggota', 'nama', 'jekel', 'kelas'],
            'permissions' => ['create_members', 'manage_members'],
        ],
    ];

    private const MAX_ROWS = 2000;

    public function index(Request $request)
    {
        $type = $this->type($request->query('type'));
        if ($deny = $this->ensureCan(self::TYPES[$type]['permissions'])) return $deny;

        $preview = session('import_preview');
        if (! $preview || ($preview['type'] ?? null) !== $type) {
            $preview = null;
        }

        return Inertia::render('Import/Index', [
            'type' => $type,
            'preview' => $preview,
        ]);
    }

    /**
     * Unduh template CSV (header saja + BOM agar rapi di Excel).
     */
    public function template(string $type): StreamedResponse
    {
        $type = $this->type($type);
        if ($deny = $this->ensureCan(self::TYPES[$type]['permissions'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses fitur ini.');
        }

        $columns = self::TYPES[$type]['columns'];

        return response()->streamDownload(function () use ($columns) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $columns);
            fclose($out);
        }, "template-{$type}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Unggah CSV → validasi per baris → simpan hasil di session untuk preview.
     */
    public function preview(Request $request, string $type)
    {
        $type = $this->type($type);
        if ($deny = $this->ensureCan(self::TYPES[$type]['permissions'])) return $deny;

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $rows = $this->parseCsv($request->file('file')->getRealPath());
        if ($rows === null) {
            return redirect()->back()->withErrors(['file' => 'File tidak terbaca sebagai CSV.']);
        }

        if (count($rows) > self::MAX_ROWS) {
            return redirect()->back()->withErrors([
                'file' => 'Maksimal ' . self::MAX_ROWS . ' baris per impor.',
            ]);
        }

        $checked = $this->checkRows($type, $rows);

        session(['import_preview' => [
            'type' => $type,
            'columns' => self::TYPES[$type]['columns'],
            'rows' => $checked,
            'valid' => collect($checked)->where('valid', true)->count(),
            'invalid' => collect($checked)->where('valid', false)->count(),
        ]]);

        return redirect()->route('import.index', ['type' => $type]);
    }

    /**
     * Simpan baris valid dari preview di session.
     */
    public function store(Request $request, string $type)
    {
        $type = $this->type($type);
        if ($deny = $this->ensureCan(self::TYPES[$type]['permissions'])) return $deny;

        $preview = session('import_preview');
        if (! $preview || ($preview['type'] ?? null) !== $type) {
            return redirect()->route('import.index', ['type' => $type])
                ->with('error', 'Preview kedaluwarsa — unggah ulang filenya.');
        }

        $created = 0;
        $skipped = 0;

        DB::transaction(function () use ($type, $preview, &$created, &$skipped) {
            foreach ($preview['rows'] as $row) {
                if (! $row['valid']) {
                    $skipped++;
                    continue;
                }
                if ($this->insertRow($type, $row['data'])) {
                    $created++;
                } else {
                    $skipped++;
                }
            }
        });

        session()->forget('import_preview');

        return redirect()->route('import.index', ['type' => $type])
            ->with('success', "Impor selesai: {$created} masuk, {$skipped} dilewati.");
    }

    private function type(?string $type): string
    {
        return isset(self::TYPES[$type]) ? $type : 'buku';
    }

    /**
     * Baca CSV jadi array assoc per baris. Null bila header tak cocok.
     * Deteksi pemisah koma/titik-koma + konversi encoding ke UTF-8.
     */
    private function parseCsv(string $path): ?array
    {
        $raw = file_get_contents($path);
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        // Buang BOM + konversi ke UTF-8 bila perlu.
        $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
        if (! mb_check_encoding($raw, 'UTF-8')) {
            $raw = mb_convert_encoding($raw, 'UTF-8', 'Windows-1252');
        }

        $lines = preg_split('/\r\n|\r|\n/', $raw);
        $lines = array_values(array_filter($lines, fn ($l) => trim($l) !== ''));
        if (count($lines) < 1) {
            return [];
        }

        $delimiter = substr_count($lines[0], ';') > substr_count($lines[0], ',') ? ';' : ',';
        $header = array_map(fn ($h) => strtolower(trim($h)), str_getcsv($lines[0], $delimiter));

        // Header boleh subset selama kolom wajib ada (urutan bebas).
        $wanted = null;
        foreach (self::TYPES as $config) {
            $cols = $config['columns'];
            if (count(array_intersect($config['required'], $header)) === count($config['required'])) {
                $wanted = $cols;
                break;
            }
        }
        if ($wanted === null) {
            return null;
        }

        $rows = [];
        for ($i = 1; $i < count($lines); $i++) {
            $cells = str_getcsv($lines[$i], $delimiter);
            $row = [];
            foreach ($wanted as $j => $col) {
                $row[$col] = isset($cells[$j]) ? trim($cells[$j]) : '';
            }
            $rows[] = ['line' => $i + 1, 'data' => $row];
        }

        return $rows;
    }

    private function checkRows(string $type, array $rows): array
    {
        $seen = [];
        $existingBooks = Book::pluck('id_buku')->flip()->toArray();
        $existingMembers = Member::pluck('id_anggota')->flip()->toArray();

        foreach ($rows as &$row) {
            $errors = $this->validateRow($type, $row['data'], $seen, $existingBooks, $existingMembers);
            $row['valid'] = empty($errors);
            $row['errors'] = $errors;
        }

        return $rows;
    }

    private function validateRow(string $type, array $d, array &$seen, array $existingBooks, array $existingMembers): array
    {
        $errors = [];

        if ($type === 'buku') {
            if ($d['id_buku'] === '') {
                $errors[] = 'ID kosong.';
            } elseif (strlen($d['id_buku']) > 10) {
                $errors[] = 'ID maksimal 10 karakter.';
            } elseif (isset($existingBooks[$d['id_buku']]) || isset($seen['buku'][$d['id_buku']])) {
                $errors[] = 'ID sudah ada.';
            }
            if ($d['judul_buku'] === '') {
                $errors[] = 'Judul kosong.';
            } elseif (strlen($d['judul_buku']) > 30) {
                $errors[] = 'Judul maksimal 30 karakter.';
            }
            if (strlen($d['pengarang']) > 30) {
                $errors[] = 'Pengarang maksimal 30 karakter.';
            }
            if ($d['jumlah'] === '' || ! ctype_digit($d['jumlah']) || (int) $d['jumlah'] > 9999) {
                $errors[] = 'Jumlah harus angka 0–9999.';
            }
            if ($d['lokasi'] !== '' && ! \App\Models\Lokasi::where('id_lokasi', $d['lokasi'])->exists()) {
                $errors[] = "Lokasi {$d['lokasi']} tidak dikenal.";
            }
            $seen['buku'][$d['id_buku']] = true;
        } else {
            if ($d['id_anggota'] === '') {
                $errors[] = 'ID/RFID kosong.';
            } elseif (strlen($d['id_anggota']) > 50) {
                $errors[] = 'ID maksimal 50 karakter.';
            } elseif (isset($existingMembers[$d['id_anggota']]) || isset($seen['anggota'][$d['id_anggota']])) {
                $errors[] = 'ID sudah ada.';
            }
            if ($d['nama'] === '') {
                $errors[] = 'Nama kosong.';
            }
            if (! in_array($d['jekel'], ['Laki-laki', 'Perempuan'], true)) {
                $errors[] = 'Jekel harus Laki-laki/Perempuan.';
            }
            if ($d['kelas'] === '') {
                $errors[] = 'Kelas kosong.';
            } elseif (strlen($d['kelas']) > 50) {
                $errors[] = 'Kelas maksimal 50 karakter.';
            }
            $seen['anggota'][$d['id_anggota']] = true;
        }

        return $errors;
    }

    /**
     * Simpan 1 baris valid. False bila gagal (mis. duplikat susulan).
     */
    private function insertRow(string $type, array $d): bool
    {
        try {
            if ($type === 'buku') {
                if (Book::where('id_buku', $d['id_buku'])->exists()) {
                    return false;
                }
                Book::create([
                    'id_buku' => $d['id_buku'],
                    'judul_buku' => $d['judul_buku'],
                    'pengarang' => $d['pengarang'] !== '' ? $d['pengarang'] : null,
                    'jumlah' => (int) $d['jumlah'],
                    'lokasi' => $d['lokasi'] !== '' ? $d['lokasi'] : null,
                ]);
                for ($i = 1; $i <= (int) $d['jumlah']; $i++) {
                    Eksemplar::create([
                        'id_buku' => $d['id_buku'],
                        'kode' => $d['id_buku'] . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    ]);
                }
            } else {
                if (Member::where('id_anggota', $d['id_anggota'])->exists()) {
                    return false;
                }
                Member::create([
                    'id_anggota' => $d['id_anggota'],
                    'nama' => $d['nama'],
                    'jekel' => $d['jekel'],
                    'kelas' => $d['kelas'],
                ]);
            }
        } catch (\Throwable) {
            return false;
        }

        return true;
    }
}
