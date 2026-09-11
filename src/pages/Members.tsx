import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMembers, setBlacklist } from '../lib/api';
import type { Member } from '../lib/types';

export default function Members() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Member[]>([]);
  const load = () => listMembers(q).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [q]);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold">Members</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / ID / UID…" className="ml-auto rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-[#5cb86b]" />
        <Link to="/register" className="rounded-lg bg-[#5cb86b] px-3 py-1.5 text-sm font-semibold text-white">+ Kiosk Daftar</Link>
      </div>
      <div className="mt-3 overflow-x-auto text-sm">
        <table className="w-full">
          <thead className="text-left text-xs text-slate-400">
            <tr><th className="py-1">ID</th><th>RFID</th><th>Nama</th><th>Kelas</th><th>No HP</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id_anggota} className="border-t">
                <td className="py-2 font-mono text-xs">{m.id_anggota}</td>
                <td className="font-mono text-xs">{m.rfid_uid}</td>
                <td className="font-medium">{m.nama}</td>
                <td>{m.kelas}</td>
                <td>{m.no_hp}</td>
                <td>
                  {m.status === 'active'
                    ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">active</span>
                    : <span title={m.blacklist_reason} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">blacklisted</span>}
                </td>
                <td>
                  {m.status === 'active' ? (
                    <button
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        const reason = window.prompt('Alasan blacklist:', 'Buku hilang / telat lama') ?? undefined;
                        if (reason === null) return;
                        await setBlacklist(m.id_anggota, true, reason || 'Diblokir petugas');
                        load();
                      }}
                    >
                      Blacklist
                    </button>
                  ) : (
                    <button
                      className="rounded-lg border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                      onClick={async () => { await setBlacklist(m.id_anggota, false); load(); }}
                    >
                      Unblacklist
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
