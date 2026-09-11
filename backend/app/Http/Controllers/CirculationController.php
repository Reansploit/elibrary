<?php

namespace App\Http\Controllers;

use App\Models\Circulation;
use Illuminate\Http\Request;

class CirculationController extends Controller
{
    public function index()
    {
        $search = request('search');
        $status = request('status');
        $perPage = (int) request('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $query = Circulation::with(['book:id,code,title', 'member:id,rfid_code,name']);
        if ($status && in_array($status, ['PIN', 'KEM'])) {
            $query->where('status', $status);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('legacy_id', 'ilike', "%{$search}%")
                    ->orWhereHas('book', function ($bookQ) use ($search) {
                        $bookQ->where('code', 'ilike', "%{$search}%")
                            ->orWhere('title', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('member', function ($memberQ) use ($search) {
                        $memberQ->where('rfid_code', 'ilike', "%{$search}%")
                            ->orWhere('name', 'ilike', "%{$search}%");
                    });
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'member_id' => ['required', 'exists:members,id'],
            'borrow_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:borrow_date'],
        ]);

        $isBookBorrowed = Circulation::where('book_id', $data['book_id'])
            ->where('status', 'PIN')
            ->exists();

        if ($isBookBorrowed) {
            return response()->json([
                'message' => 'Buku ini masih dipinjam dan belum dikembalikan.',
            ], 422);
        }

        $circulation = Circulation::create([
            ...$data,
            'status' => 'PIN',
        ]);

        return response()->json($circulation->load(['book:id,code,title', 'member:id,rfid_code,name']), 201);
    }

    public function returnBook(Circulation $circulation)
    {
        if ($circulation->status === 'KEM') {
            return response()->json(['message' => 'Buku sudah dikembalikan.'], 422);
        }

        $circulation->update([
            'status' => 'KEM',
            'return_date' => now()->toDateString(),
        ]);

        return response()->json($circulation->load(['book:id,code,title', 'member:id,rfid_code,name']));
    }
}
