import { useEffect, useState } from 'react';
import { checkin, checkout, getLoanSettings, listBooks, listLoans, lookupMember } from '../lib/api';
import type { Book, Loan, LoanSettings } from '../lib/types';
import { ApiError } from '../lib/types';
import { simulateScan, useRfidScan } from '../hooks/useRfidScan';
import { normalizeUid } from '../lib/rfid';

export default function Checkout() {
  const [tab, setTab] = useState<'pinjam' | 'kembali'>('pinjam');
  const [uid, setUid] = useState('');
  const [member, setMember] = useState<Awaited<ReturnType<typeof lookupMember>> | null>(null);
  const [err, setErr] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [settings, setSettings] = useState<LoanSettings | null>(null);
  const [dueDays, setDueDays] = useState(7);
  const [result, setResult] = useState('');
  // return
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmUid, setConfirmUid] = useState('');

  useEffect(() => { getLoanSettings().then((s) => { setSettings(s); setDueDays(s.default_loan_days); }); }, []);
  useEffect(() => { listBooks(q).then((r) => setBooks(r.data)); }, [q]);

  const doLookup = async (raw: string) => {
    setErr(''); setResult(''); setMember(null);
    try {
      const m = await lookupMember(raw);
      setMember(m);
      setUid(normalizeUid(raw));
      // muat pinjaman aktif member untuk tab kembali
      const all = await listLoans();
      setActiveLoans(all.data.filter((l) => l.id_anggota === m.id_anggota && l.status !== 'returned'));
      setSelected([]);
    } catch (e) {
      setErr(e instanceof ApiError ? `${e.code}: ${e.message}` : 'Lookup gagal');
    }
  };

  // Scan global: jika fokus bukan di search, anggap scan anggota/konfirmasi
  useRfidScan({
    enabled: true,
    onScan: (scanned) => {
      if (tab === 'kembali' && member && selected.length > 0 && !confirmUid) {
        setConfirmUid(scanned);
      } else {
        doLookup(scanned);
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-sm">
        {(['pinjam', 'kembali'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 font-semibold ${tab === t ? 'bg-[#5cb86b] text-white' : 'bg-white text-slate-600'}`}>
            {t === 'pinjam' ? 'Peminjaman' : 'Pengembalian (wajib scan)'}
          </button>
        ))}
        <span className="ml-auto hidden text-xs text-slate-400 sm:inline">Default: {settings?.default_loan_days ?? '…'} hari • Maks {settings?.max_books_per_member} buku • Denda Rp{settings?.fine_per_day}/hari</span>
      </div>

      {/* STEP 1: scan anggota */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-bold">Step 1 — Scan kartu anggota</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input data-rfid="true" value={uid} onChange={(e) => setUid(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') doLookup(uid); }}
            placeholder="Tap kartu / ketik UID + Enter" className="rfid-input w-64 rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-[#5cb86b]" />
          <button onClick={() => doLookup(uid)} className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">Cari</button>
          <button onClick={() => simulateScan('A1B2C3D4')} className="text-xs text-slate-400 underline">Simulasi scan Ana</button>
          <button onClick={() => simulateScan('C3D4E5F6')} className="text-xs text-slate-400 underline">Simulasi scan (blacklist)</button>
        </div>
        {err && <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{err}</p>}
        {member && (
          <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
            ✓ {member.nama} ({member.id_anggota}) • Kelas {member.kelas} • Aktif: {member.pinjaman_aktif} • Overdue: {member.overdue} • Denda: Rp{member.denda}
          </div>
        )}
      </div>

      {tab === 'pinjam' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
            <p className="text-sm font-bold">Step 2 — Pilih buku (page khusus peminjaman)</p>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ISBN / judul / author…" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#5cb86b]" />
            <div className="mt-2 max-h-80 space-y-1 overflow-auto text-sm">
              {books.map((b) => (
                <label key={b.id_buku} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 hover:bg-slate-50">
                  <input type="checkbox" checked={cart.includes(b.id_buku)} disabled={b.stok_tersedia <= 0}
                    onChange={() => setCart((c) => (c.includes(b.id_buku) ? c.filter((x) => x !== b.id_buku) : [...c, b.id_buku]))} />
                  <span className="font-mono text-xs text-slate-400">{b.id_buku}</span>
                  <span className="font-medium">{b.judul}</span>
                  <span className="text-xs text-slate-500">— {b.pengarang} • ISBN {b.isbn}</span>
                  <span className={`ml-auto text-xs ${b.stok_tersedia > 0 ? 'text-green-600' : 'text-red-500'}`}>Stok {b.stok_tersedia}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-bold">Step 3–4 — Durasi & konfirmasi</p>
            <label className="mt-2 block text-xs text-slate-500">Durasi (hari) — override petugas, default {settings?.default_loan_days}</label>
            <input type="number" min={1} max={60} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#5cb86b]" />
            <p className="mt-2 text-sm">Keranjang: <b>{cart.length}</b> buku</p>
            {result && <p className="mt-2 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800">{result}</p>}
            <button
              disabled={!member || cart.length === 0}
              onClick={async () => {
                setResult(''); setErr('');
                try {
                  const r = await checkout(uid, cart, dueDays);
                  setResult(`Berhasil! ${r.id_transaksi}, jatuh tempo ${r.due_date}, ${r.items.length} buku.`);
                  setCart([]);
                } catch (e) { setErr(e instanceof ApiError ? `${e.code}: ${e.message}` : 'Checkout gagal'); }
              }}
              className="mt-3 w-full rounded-xl bg-[#5cb86b] py-2.5 text-sm font-bold text-white hover:bg-[#45a055] disabled:opacity-50"
            >
              Proses Pinjam
            </button>
            {!member && <p className="mt-2 text-xs text-slate-400">Scan kartu anggota dulu.</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-bold">Pilih pinjaman aktif untuk dikembalikan</p>
          {!member && <p className="mt-2 text-sm text-slate-400">Scan kartu anggota dulu untuk memuat pinjaman.</p>}
          <div className="mt-2 space-y-1 text-sm">
            {activeLoans.map((l) => (
              <label key={l.id_sk} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
                <input type="checkbox" checked={selected.includes(l.id_sk)} onChange={() => setSelected((s) => (s.includes(l.id_sk) ? s.filter((x) => x !== l.id_sk) : [...s, l.id_sk]))} />
                <span className="font-mono text-xs">{l.id_sk}</span><span className="font-medium">{l.judul}</span>
                <span className="text-xs text-slate-500">Jatuh tempo {l.due_date} • {l.status}</span>
              </label>
            ))}
            {member && activeLoans.length === 0 && <p className="text-sm text-slate-400">Tidak ada pinjaman aktif.</p>}
          </div>
          {selected.length > 0 && (
            <div className="mt-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-3">
              <p className="text-sm font-bold">Wajib scan ulang kartu yang sama sebagai konfirmasi</p>
              <div className="mt-2 flex gap-2">
                <input data-rfid="true" value={confirmUid} onChange={(e) => setConfirmUid(e.target.value.toUpperCase())} placeholder="Scan ulang kartu…" className="rfid-input w-64 rounded-lg border bg-white px-3 py-2 font-mono text-sm outline-none" />
                <button
                  onClick={async () => {
                    setResult(''); setErr('');
                    try {
                      const r = await checkin(uid, selected, confirmUid || uid);
                      setResult(`Kembali OK: ${r.returned} buku, total denda Rp${r.total_fine}.`);
                      setSelected([]); setConfirmUid('');
                      doLookup(uid);
                    } catch (e) { setErr(e instanceof ApiError ? `${e.code}: ${e.message}` : 'Checkin gagal'); }
                  }}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white"
                >
                  Konfirmasi Kembali
                </button>
              </div>
            </div>
          )}
          {result && <p className="mt-2 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800">{result}</p>}
        </div>
      )}
    </div>
  );
}
