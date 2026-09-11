<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Member;
use App\Models\Circulation;
use App\Models\LoanLog;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalBooks = Book::count();
        $totalMembers = Member::count();
        $totalBorrowed = Circulation::where('status', 'PIN')->count();
        $totalReturned = Circulation::where('status', 'KEM')->count();

        $today = Carbon::today();
        $todayStr = $today->format('Y-m-d');

        // Overdue loans: status PIN and tgl_kembali < today
        $totalOverdue = Circulation::where('status', 'PIN')
            ->where('tgl_kembali', '<', $todayStr)
            ->where('tgl_kembali', '!=', '0000-00-00')
            ->count();

        // Due soon: status PIN and tgl_kembali is today or within 3 days
        $totalDueSoon = Circulation::where('status', 'PIN')
            ->where('tgl_kembali', '>=', $todayStr)
            ->where('tgl_kembali', '<=', $today->copy()->addDays(3)->format('Y-m-d'))
            ->where('tgl_kembali', '!=', '0000-00-00')
            ->count();

        $recentLoans = Circulation::with(['book', 'member'])
            ->orderBy('tgl_pinjam', 'desc')
            ->take(5)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'member' => $c->member?->nama ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y'),
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'status' => $c->status,
                ];
            });

        // Overdue loans: status PIN and tgl_kembali < today
        $overdueLoans = Circulation::with(['book', 'member'])
            ->where('status', 'PIN')
            ->where('tgl_kembali', '<', $todayStr)
            ->where('tgl_kembali', '!=', '0000-00-00')
            ->orderBy('tgl_kembali')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'member' => $c->member?->nama ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y'),
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'days_overdue' => Carbon::parse($c->tgl_kembali)->diffInDays($today),
                ];
            });

        // Due soon: will be due within the next 3 days
        $dueSoonLoans = Circulation::with(['book', 'member'])
            ->where('status', 'PIN')
            ->where('tgl_kembali', '>=', $todayStr)
            ->where('tgl_kembali', '<=', $today->copy()->addDays(3)->format('Y-m-d'))
            ->where('tgl_kembali', '!=', '0000-00-00')
            ->orderBy('tgl_kembali')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'member' => $c->member?->nama ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y'),
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'days_until_due' => Carbon::parse($c->tgl_kembali)->diffInDays($today),
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalBooks' => $totalBooks,
                'totalMembers' => $totalMembers,
                'totalBorrowed' => $totalBorrowed,
                'totalReturned' => $totalReturned,
                'totalOverdue' => $totalOverdue,
                'totalDueSoon' => $totalDueSoon,
            ],
            'recentLoans' => $recentLoans,
            'overdueLoans' => $overdueLoans,
            'dueSoonLoans' => $dueSoonLoans,
        ]);
    }
}
