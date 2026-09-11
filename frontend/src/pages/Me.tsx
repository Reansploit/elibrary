import { useState } from 'react';
import { EyeIcon } from '../components/EyeIcon';
import { listLoans, lookupMember } from '../lib/api';
import { ApiError } from '../lib/types';
import { useRfidScan } from '../hooks/useRfidScan';

/** Portal anggota: scan kartu sendiri untuk lihat pinjaman + denda. UID tersensor. */
export default function Me() {
  const [uid, setUid] = useState('');
  const [showUid, setShowUid] = useState(false);
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
      <div className="rounded-xl bg-surface p-4 shadow-sm">
        <p className="text-sm font-bold">Portal Anggota — Pinjaman Saya</p>
        <div className="mt-2 flex gap-2">
          <span className="relative inline-flex flex-1">
            <input
              data-rfid="true"
              type={showUid ? 'text' : 'password'}
              value={uid}
              onChange={(e) => setUid(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') load(uid); }}
              placeholder="Tap kartu anggota…"
              className="rfid-input w-full rounded-lg border border-line bg-surface py-2 pl-3 pr-9 font-mono text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
            />
            <button type="button" onClick={() => setShowUid((v) => !v)} title={showUid ? 'Sembunyikan UID' : 'Tampilkan UID'} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink">
              <EyeIcon off={showUid} />
            </button>
          </span>
          <button onClick={() => load(uid)} className="rounded-lg bg-ink px-4 py-2 text-sm text-surface">Lihat</button>
        </div>
        {err && <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">{err}</p>}
      </div>
      {data && (
        <div className="rounded-xl bg-surface p-4 shadow-sm text-sm">
          <p className="font-bold">{data.nama} ({data.id_anggota})</p>
          <p className="text-muted">Kelas {data.kelas} • Kamar {data.kamar} • Aktif {data.pinjaman_aktif} • Overdue {data.overdue} • Denda Rp{data.denda}</p>
          <div className="mt-2 space-y-1">
            {loans.map((l) => (
              <div key={l.id_sk} className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5">
                <span className="font-mono text-xs text-faint">{l.id_sk}</span>
                <span className="font-medium">{l.judul}</span>
                <span className="text-xs text-muted">tempo {l.due_date}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${l.status === 'returned' ? 'bg-surface-2 text-muted' : l.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' : 'bg-brand-soft text-brand'}`}>{l.status}</span>
              </div>
            ))}
            {loans.length === 0 && <p className="text-faint">Belum ada pinjaman.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
