<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SanksiController extends Controller
{
    public function index()
    {
        if ($deny = $this->ensureCan(['view_members', 'manage_members'])) return $deny;

        $today = Carbon::today();

        $members = Member::orderBy('nama')->get()->map(function ($m) use ($today) {
            $sanctioned = $m->isSanctioned();
            $until = $m->sanksi_sampai ? Carbon::parse($m->sanksi_sampai) : null;

            return [
                'id' => $m->id_anggota,
                'name' => $m->nama,
                'class' => $m->kelas,
                'sanctioned' => $sanctioned,
                'until' => $until ? $until->format('d/m/Y') : null,
                'remaining' => $sanctioned && $until ? max(0, $today->diffInDays($until, false)) : null,
            ];
        });

        return Inertia::render('Sanksi/Index', [
            'members' => $members,
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($deny = $this->ensureCan(['manage_members'])) return $deny;
        $member = Member::findOrFail($id);

        $validated = $request->validate([
            'sanksi' => 'required|boolean',
            'lama_sanksi' => 'nullable|integer|min:1|max:365',
        ]);

        $sanksi = (bool) $validated['sanksi'];

        $member->update([
            'sanksi' => $sanksi,
            'sanksi_sampai' => $sanksi
                ? Carbon::today()->addDays($validated['lama_sanksi'] ?? 7)->toDateString()
                : null,
        ]);

        return redirect()->back()->with(
            'success',
            $sanksi ? 'Pembatasan berhasil diberikan.' : 'Pembatasan berhasil dicabut.'
        );
    }
}
