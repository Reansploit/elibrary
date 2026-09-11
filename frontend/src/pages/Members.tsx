import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon } from '../components/EyeIcon';
import { listMembers, setBlacklist } from '../lib/api';
import { maskUid } from '../lib/rfid';
import type { Member } from '../lib/types';

export default function Members() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Member[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const load = () => listMembers(q).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [q]);

  const toggle = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const vis = (id: string) => showAll || revealed.has(id);
  const uidText = (m: Member) => (vis(m.id_anggota) ? m.rfid_uid : maskUid(m.rfid_uid));

  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold">Members</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / ID / UID…" className="ml-auto rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none placeholder:text-faint focus:border-brand" />
        <button
          onClick={() => setShowAll((v) => !v)}
          title="UID RFID disembunyikan secara default demi privasi kartu"
          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-ink"
        >
          <EyeIcon off={showAll} /> {showAll ? 'Sembunyikan RFID' : 'Tampilkan RFID'}
        </button>
        <Link to="/register" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">+ Kiosk Daftar</Link>
      </div>
      <div className="mt-3 overflow-x-auto text-sm">
        <table className="w-full">
          <thead className="text-left text-xs text-faint">
            <tr><th className="py-1">ID</th><th>RFID</th><th>Nama</th><th>Kelas</th><th>Kamar</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id_anggota} className="border-t border-line">
                <td className="py-2 font-mono text-xs text-faint">{m.id_anggota}</td>
                <td className="font-mono text-xs">
                  {uidText(m)}{' '}
                  <button onClick={() => toggle(m.id_anggota)} className="align-middle text-faint hover:text-ink" title={vis(m.id_anggota) ? 'Sembunyikan UID' : 'Tampilkan UID'}>
                    <EyeIcon off={vis(m.id_anggota)} />
                  </button>
                </td>
                <td className="font-medium">{m.nama}</td>
                <td className="text-muted">{m.kelas}</td>
                <td className="font-mono text-xs">{m.kamar}</td>
                <td>
                  {m.status === 'active'
                    ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">active</span>
                    : <span title={m.blacklist_reason} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-500/15 dark:text-red-300">blacklisted</span>}
                </td>
                <td>
                  {m.status === 'active' ? (
                    <button
                      className="rounded-lg border border-line px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 dark:text-red-400"
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
                      className="rounded-lg border border-line px-2 py-1 text-xs text-brand hover:bg-brand-soft"
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
