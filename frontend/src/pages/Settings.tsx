import { useEffect, useState } from 'react';
import { getLoanSettings, saveLoanSettings } from '../lib/api';
import type { LoanSettings } from '../lib/types';
import { resetDb } from '../mocks/db';

export default function Settings() {
  const [s, setS] = useState<LoanSettings | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { getLoanSettings().then(setS); }, []);

  if (!s) return <p className="text-sm text-muted">Memuat…</p>;
  const field = 'mt-1 w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-ink outline-none focus:border-brand';
  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-xl bg-surface p-4 shadow-sm">
        <p className="text-sm font-bold">Settings — Aturan Peminjaman (Global)</p>
        <p className="mt-1 text-xs text-muted">Diubah oleh Administrator. Berlaku sebagai default di halaman checkout, petugas bisa override per transaksi.</p>
        <div className="mt-3 grid gap-2 text-sm">
          <label>Default lama pinjam (hari)<input type="number" value={s.default_loan_days} onChange={(e) => setS({ ...s, default_loan_days: Number(e.target.value) })} className={field} /></label>
          <label>Maks buku per anggota<input type="number" value={s.max_books_per_member} onChange={(e) => setS({ ...s, max_books_per_member: Number(e.target.value) })} className={field} /></label>
          <label>Denda per hari (Rp)<input type="number" value={s.fine_per_day} onChange={(e) => setS({ ...s, fine_per_day: Number(e.target.value) })} className={field} /></label>
          <button onClick={async () => { await saveLoanSettings(s); setMsg('Tersimpan ✓'); }} className="rounded-xl bg-brand py-2 font-bold text-white hover:bg-brand-dark">Simpan</button>
          {msg && <p className="text-sm text-brand">{msg}</p>}
        </div>
      </div>
      <div className="rounded-xl bg-surface p-4 shadow-sm text-sm">
        <p className="font-bold">Zona Berbahaya (mock)</p>
        <button onClick={() => { resetDb(); window.location.reload(); }} className="mt-2 rounded-lg border border-line px-3 py-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-400">Reset data mock ke awal</button>
      </div>
      <div className="rounded-xl bg-surface p-4 shadow-sm text-sm">
        <p className="font-bold">Help — Cara pakai scanner RFID</p>
        <ol className="mt-1 list-decimal pl-5 text-muted">
          <li>Colok scanner USB, buka halaman Register/Checkout.</li>
          <li>Klik field UID / otomatis fokus, lalu tap kartu.</li>
          <li>UID + Enter terbaca otomatis (tidak perlu klik tombol).</li>
          <li>Klik ikon mata untuk mengintip UID yang tersensor.</li>
        </ol>
      </div>
    </div>
  );
}
