<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Circulation;
use App\Models\Member;
use App\Models\Reservasi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Pencarian global: JSON untuk dropdown live, halaman penuh (/cari)
     * bila dibuka langsung (mis. Enter di kolom cari).
     * Tiap kelompok hanya dikembalikan bila user punya izin lihatnya.
     */
    public function index(Request $request)
    {
        $q = trim($request->query('q', ''));

        if ($request->expectsJson()) {
            return response()->json($this->search($request->user(), $q, 8));
        }

        return Inertia\Inertia::render('Search/Index', [
            'q' => $q,
            'results' => $this->search($request->user(), $q, 50),
        ]);
    }

    private function search($user, string $q, int $limit): array
    {
        $empty = ['books' => [], 'members' => [], 'users' => []];

        if (mb_strlen($q) < 1) {
            return $empty;
        }

        $like = "%{$q}%";

        if ($user && $user->hasAnyPermission(['view_books', 'manage_books'])) {
            $empty['books'] = Book::with('lokasiRak')->where('judul_buku', 'like', $like)
                ->orWhere('id_buku', 'like', $like)
                ->orWhere('pengarang', 'like', $like)
                ->orderBy('judul_buku')
                ->limit($limit)
                ->get()
                ->map(function ($b) {
                    $activeLoans = Circulation::with('member')
                        ->where('id_buku', $b->id_buku)
                        ->where('status', 'PIN')
                        ->get();
                    $activeLoan = $activeLoans->first();
                    $stock = max(0, (int) $b->jumlah);

                    return [
                        'id' => $b->id_buku,
                        'title' => $b->judul_buku,
                        'author' => $b->pengarang,
                        'stock' => $b->jumlah,
                        'photo' => static::photoUrl($b->foto),
                        'location' => $b->lokasiRak ? $b->lokasiRak->id_lokasi . ' — ' . $b->lokasiRak->nama : null,
                        'borrowed' => $activeLoans->isNotEmpty(),
                        'remaining' => $stock - $activeLoans->count(),
                        'reserved' => Reservasi::where('id_buku', $b->id_buku)
                            ->whereIn('status', ['antre', 'siap'])
                            ->count(),
                        'borrower' => $activeLoan?->member?->nama,
                        'due' => $activeLoan && $activeLoan->tgl_kembali
                            ? Carbon::parse($activeLoan->tgl_kembali)->format('d/m/Y')
                            : null,
                    ];
                });
        }

        if ($user && $user->hasAnyPermission(['view_members', 'manage_members'])) {
            $empty['members'] = Member::where('nama', 'like', $like)
                ->orWhere('id_anggota', 'like', $like)
                ->orWhere('kelas', 'like', $like)
                ->orderBy('nama')
                ->limit($limit)
                ->get()
                ->map(function ($m) {
                    $loans = Circulation::with('book')
                        ->where('id_anggota', $m->id_anggota)
                        ->where('status', 'PIN')
                        ->get()
                        ->map(function ($c) {
                            return [
                                'book' => $c->book?->judul_buku ?? '-',
                                'due' => $c->tgl_kembali
                                    ? Carbon::parse($c->tgl_kembali)->format('d/m/Y')
                                    : null,
                            ];
                        });

                    return [
                        'id' => $m->id_anggota,
                        'name' => $m->nama,
                        'class' => $m->kelas,
                        'photo' => static::photoUrl($m->foto),
                        'sanctioned' => $m->isSanctioned(),
                        'loans' => $loans,
                    ];
                });
        }

        if ($user && $user->hasAnyPermission(['manage_users'])) {
            $empty['users'] = User::with('roles')
                ->where('name', 'like', $like)
                ->orWhere('username', 'like', $like)
                ->orderBy('name')
                ->limit($limit)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'username' => $u->username,
                        'role' => $u->roles->pluck('name')->first() ?? 'Petugas',
                    ];
                });
        }

        return $empty;
    }
}
