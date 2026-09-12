<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Circulation;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_members', 'manage_members'])) return $deny;
        $members = Member::orderBy('nama')->get()->map(function ($m) {
            return [
                'id' => $m->id_anggota,
                'name' => $m->nama,
                'gender' => $m->jekel,
                'class' => $m->kelas,
                'photo' => static::photoUrl($m->foto),
            ];
        });

        return Inertia::render('Members/Index', [
            'members' => $members,
        ]);
    }

    public function create()
    {
        if ($deny = $this->ensureCan(['create_members', 'manage_members'])) return $deny;
        return Inertia::render('Members/Form', [
            'member' => null,
        ]);
    }

    public function store(Request $request)
    {
        if ($deny = $this->ensureCan(['create_members', 'manage_members'])) return $deny;
        $validated = $request->validate([
            'id_anggota' => 'required|string|max:50|unique:tb_anggota,id_anggota',
            'nama' => 'required|string',
            'jekel' => 'required|in:Laki-laki,Perempuan',
            'kelas' => 'required|string|max:50',
            'foto' => 'nullable|image|max:2048',
        ]);

        $validated['foto'] = $this->storePhoto($request, 'foto', 'foto-anggota');

        Member::create($validated);

        return redirect()->route('members.index')
            ->with('success', 'Anggota berhasil ditambahkan.');
    }

    public function edit($id)
    {
        if ($deny = $this->ensureCan(['edit_members', 'manage_members'])) return $deny;
        $member = Member::findOrFail($id);

        return Inertia::render('Members/Form', [
            'member' => [
                'id' => $member->id_anggota,
                'name' => $member->nama,
                'gender' => $member->jekel,
                'class' => $member->kelas,
                'photo' => static::photoUrl($member->foto),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['edit_members', 'manage_members'])) return $deny;
        $member = Member::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string',
            'jekel' => 'required|in:Laki-laki,Perempuan',
            'kelas' => 'required|string|max:50',
            'foto' => 'nullable|image|max:2048',
        ]);

        $validated['foto'] = $this->storePhoto($request, 'foto', 'foto-anggota', $member->foto);

        $member->update($validated);

        return redirect()->route('members.index')
            ->with('success', 'Anggota berhasil diperbarui.');
    }

    public function show($id)
    {
        if ($deny = $this->ensureCan(['view_members', 'manage_members'])) return $deny;
        $member = Member::findOrFail($id);
        $today = Carbon::today();

        $loans = Circulation::with('book')
            ->where('id_anggota', $member->id_anggota)
            ->where('status', 'PIN')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y') ?? '-',
                    'due' => $c->tgl_kembali
                        ? Carbon::parse($c->tgl_kembali)->format('d/m/Y')
                        : null,
                ];
            });

        $history = Circulation::with('book')
            ->where('id_anggota', $member->id_anggota)
            ->orderBy('tgl_pinjam', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id_sk,
                    'book' => $c->book?->judul_buku ?? '-',
                    'borrow_date' => $c->tgl_pinjam?->format('d/m/Y') ?? '-',
                    'return_date' => $c->tgl_kembali?->format('d/m/Y') ?? '-',
                    'status' => $c->status,
                ];
            });

        $until = $member->sanksi_sampai ? Carbon::parse($member->sanksi_sampai) : null;

        return Inertia::render('Members/Show', [
            'member' => [
                'id' => $member->id_anggota,
                'name' => $member->nama,
                'gender' => $member->jekel,
                'class' => $member->kelas,
                'photo' => static::photoUrl($member->foto),
                'sanctioned' => $member->isSanctioned(),
                'sanction_until' => $until ? $until->format('d/m/Y') : null,
            ],
            'loans' => $loans,
            'history' => $history,
        ]);
    }

    public function destroy($id)
    {
        if ($deny = $this->ensureCan(['delete_members', 'manage_members'])) return $deny;
        $member = Member::findOrFail($id);

        $this->deletePhoto($member->foto);
        $member->delete();

        return redirect()->route('members.index')
            ->with('success', 'Anggota berhasil dihapus.');
    }
}
