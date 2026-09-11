<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        $search = request('search');
        $perPage = (int) request('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $query = Member::query();
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('rfid_code', 'ilike', "%{$search}%")
                    ->orWhere('name', 'ilike', "%{$search}%")
                    ->orWhere('class_name', 'ilike', "%{$search}%")
                    ->orWhere('room_name', 'ilike', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'rfid_code' => ['required', 'string', 'max:50', 'unique:members,rfid_code'],
            'name' => ['required', 'string', 'max:120'],
            'class_name' => ['required', 'string', 'max:80'],
            'room_name' => ['required', 'string', 'max:80'],
        ]);

        $member = Member::create($data);

        return response()->json($member, 201);
    }

    public function destroy(Member $member)
    {
        $member->delete();

        return response()->json([
            'message' => 'Anggota berhasil dihapus.',
        ]);
    }

    public function update(Request $request, Member $member)
    {
        $data = $request->validate([
            'rfid_code' => ['required', 'string', 'max:50', 'unique:members,rfid_code,' . $member->id],
            'name' => ['required', 'string', 'max:120'],
            'class_name' => ['required', 'string', 'max:80'],
            'room_name' => ['required', 'string', 'max:80'],
        ]);

        $member->update($data);

        return response()->json($member);
    }
}
