import { useState } from 'react';
import { listLoans, lookupMember } from '../lib/api';
import { ApiError } from '../lib/types';
import { simulateScan, useRfidScan } from '../hooks/useRfidScan';

/** Portal anggota: scan kartu sendiri untuk lihat pinjaman + denda. */
export default function Me() {
  const [uid, setUid] = useState('');
  const [data, setData] = useState<Awaited<ReturnType<typeof lookupMember>> | null>(null);
  const [loans, setLoans] = useState<Awaited<ReturnType<typeof listLoans>>['data']>([]);
  const [err, setErr] = useState('');

  const load = async (raw: string) => {
    setErr('');
    try {
      const m = await lookupMember(raw);
      setData(m);
      const all = await listLoans();
      setLoans(all.data.filter((l) => l.id_anggota === m.id_anggota));
    } catch (e) { setErr(e instanceof ApiError ? e.message : 'Gagal'); }
  };

  useRfidScan({ enabled: true, onScan: (s) => { setUid(s); load(s); } });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-bold">Portal Anggota — Pinjaman Saya</p>
        <div className="mt-2 flex gap-2">
          <input data-rfid="true" value={uid} onChange={(e) => setUid(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') load(uid); }}
            placeholder="Tap kartu anggota…" className="rfid-input flex-1 rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-[#5cb86b]" />
          <button onClick={() => load(uid)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white">Lihat</button>
          <button onClick={() => simulateScan('A1B2C3D4')} className="text-xs text-slate-400 underline">Demo</button>
        </div>
        {err && <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{err}</p>}
      </div>
      {data && (
        <div className="rounded-xl bg-white p-4 shadow-sm text-sm">
          <p className="font-bold">{data.nama} ({data.id_anggota})</p>
          <p className="text-slate-500">Aktif {data.pinjaman_aktif} • Overdue {data.overdue} • Denda Rp{data.denda}</p>
          <div className="mt-2 space-y-1">
            {loans.map((l) => (
              <div key={l.id_sk} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
                <span className="font-mono text-xs">{l.id_sk}</span>
                <span className="font-medium">{l.judul}</span>
                <span className="text-xs text-slate-500">tempo {l.due_date}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${l.status === 'returned' ? 'bg-slate-100 text-slate-500' : l.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{l.status}</span>
              </div>
            ))}
            {loans.length === 0 && <p className="text-slate-400">Belum ada pinjaman.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
