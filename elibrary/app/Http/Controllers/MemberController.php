<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        $members = Member::orderBy('nama')->get()->map(function ($m) {
            return [
                'id' => $m->id_anggota,
                'name' => $m->nama,
                'gender' => $m->jekel,
                'class' => $m->kelas,
            ];
        });

        return Inertia::render('Members/Index', [
            'members' => $members,
        ]);
    }

    public function create()
    {
        return Inertia::render('Members/Form', [
            'member' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_anggota' => 'required|string|max:50|unique:tb_anggota,id_anggota',
            'nama' => 'required|string',
            'jekel' => 'required|in:Laki-laki,Perempuan',
            'kelas' => 'required|string|max:50',
        ]);

        Member::create($validated);

        return redirect()->route('members.index')
            ->with('success', 'Anggota berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $member = Member::findOrFail($id);

        return Inertia::render('Members/Form', [
            'member' => [
                'id' => $member->id_anggota,
                'name' => $member->nama,
                'gender' => $member->jekel,
                'class' => $member->kelas,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $member = Member::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string',
            'jekel' => 'required|in:Laki-laki,Perempuan',
            'kelas' => 'required|string|max:50',
        ]);

        $member->update($validated);

        return redirect()->route('members.index')
            ->with('success', 'Anggota berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $member = Member::findOrFail($id);
        $member->delete();

        return redirect()->route('members.index')
            ->with('success', 'Anggota berhasil dihapus.');
    }
}
