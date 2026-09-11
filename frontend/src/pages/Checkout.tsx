import { useEffect, useState } from 'react';
import { checkin, checkout, getLoanSettings, listBooks, listLoans, lookupMember } from '../lib/api';
import type { Book, Loan, LoanSettings } from '../lib/types';
import { ApiError } from '../lib/types';
import { useRfidScan } from '../hooks/useRfidScan';
import { normalizeUid } from '../lib/rfid';
import { EyeIcon } from '../components/EyeIcon';

const inputCls = 'rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-brand';
const errCls = 'mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300';
const okCls = 'mt-2 rounded-lg bg-brand-soft px-3 py-2 text-sm text-ink';

/** Field UID tersensor (password) + tombol intip — dipakai untuk semua input scan. */
function ScanInput({ value, onChange, onEnter, placeholder }: { value: string; onChange: (v: string) => void; onEnter?: () => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <input
        data-rfid="true"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        placeholder={placeholder}
        className={`rfid-input w-64 pr-9 font-mono ${inputCls}`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        title={show ? 'Sembunyikan UID' : 'Tampilkan UID'}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
      >
        <EyeIcon off={show} />
      </button>
    </span>
  );
}

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
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 font-semibold ${tab === t ? 'bg-brand text-white' : 'bg-surface text-muted hover:text-ink'}`}>
            {t === 'pinjam' ? 'Peminjaman' : 'Pengembalian (wajib scan)'}
          </button>
        ))}
        <span className="ml-auto hidden text-xs text-faint sm:inline">Default: {settings?.default_loan_days ?? '…'} hari • Maks {settings?.max_books_per_member} buku • Denda Rp{settings?.fine_per_day}/hari</span>
      </div>

      {/* STEP 1: scan anggota */}
      <div className="rounded-xl bg-surface p-4 shadow-sm">
        <p className="text-sm font-bold">Step 1 — Scan kartu anggota</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ScanInput value={uid} onChange={setUid} onEnter={() => doLookup(uid)} placeholder="Tap kartu / ketik UID + Enter" />
          <button onClick={() => doLookup(uid)} className="rounded-lg bg-ink px-3 py-2 text-sm text-surface">Cari</button>
        </div>
        {err && <p className={errCls}>{err}</p>}
        {member && (
          <div className="mt-2 rounded-lg bg-brand-soft px-3 py-2 text-sm text-ink">
            ✓ {member.nama} ({member.id_anggota}) • Kelas {member.kelas} • Kamar {member.kamar} • Aktif: {member.pinjaman_aktif} • Overdue: {member.overdue} • Denda: Rp{member.denda}
          </div>
        )}
      </div>

      {tab === 'pinjam' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-surface p-4 shadow-sm lg:col-span-2">
            <p className="text-sm font-bold">Step 2 — Pilih buku (page khusus peminjaman)</p>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ISBN / judul / author…" className={`mt-2 w-full ${inputCls}`} />
            <div className="mt-2 max-h-80 space-y-1 overflow-auto text-sm">
              {books.map((b) => (
                <label key={b.id_buku} className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 hover:bg-surface-2">
                  <input type="checkbox" checked={cart.includes(b.id_buku)} disabled={b.stok_tersedia <= 0} className="accent-[#de7a00]"
                    onChange={() => setCart((c) => (c.includes(b.id_buku) ? c.filter((x) => x !== b.id_buku) : [...c, b.id_buku]))} />
                  <span className="font-mono text-xs text-faint">{b.id_buku}</span>
                  <span className="font-medium">{b.judul}</span>
                  <span className="text-xs text-muted">— {b.pengarang} • ISBN {b.isbn}</span>
                  <span className={`ml-auto text-xs ${b.stok_tersedia > 0 ? 'text-brand' : 'text-red-500 dark:text-red-400'}`}>Stok {b.stok_tersedia}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-sm">
            <p className="text-sm font-bold">Step 3–4 — Durasi & konfirmasi</p>
            <label className="mt-2 block text-xs text-muted">Durasi (hari) — override petugas, default {settings?.default_loan_days}</label>
            <input type="number" min={1} max={60} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} className={`mt-1 w-full ${inputCls}`} />
            <p className="mt-2 text-sm">Keranjang: <b>{cart.length}</b> buku</p>
            {result && <p className={okCls}>{result}</p>}
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
              className="mt-3 w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Proses Pinjam
            </button>
            {!member && <p className="mt-2 text-xs text-faint">Scan kartu anggota dulu.</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-surface p-4 shadow-sm">
          <p className="text-sm font-bold">Pilih pinjaman aktif untuk dikembalikan</p>
          {!member && <p className="mt-2 text-sm text-faint">Scan kartu anggota dulu untuk memuat pinjaman.</p>}
          <div className="mt-2 space-y-1 text-sm">
            {activeLoans.map((l) => (
              <label key={l.id_sk} className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5">
                <input type="checkbox" checked={selected.includes(l.id_sk)} className="accent-[#de7a00]" onChange={() => setSelected((s) => (s.includes(l.id_sk) ? s.filter((x) => x !== l.id_sk) : [...s, l.id_sk]))} />
                <span className="font-mono text-xs">{l.id_sk}</span><span className="font-medium">{l.judul}</span>
                <span className="text-xs text-muted">Jatuh tempo {l.due_date} • {l.status}</span>
              </label>
            ))}
            {member && activeLoans.length === 0 && <p className="text-sm text-faint">Tidak ada pinjaman aktif.</p>}
          </div>
          {selected.length > 0 && (
            <div className="mt-3 rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-3">
              <p className="text-sm font-bold">Wajib scan ulang kartu yang sama sebagai konfirmasi</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ScanInput value={confirmUid} onChange={setConfirmUid} placeholder="Scan ulang kartu…" />
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
                  className="rounded-lg bg-ink px-4 py-2 text-sm text-surface"
                >
                  Konfirmasi Kembali
                </button>
              </div>
            </div>
          )}
          {result && <p className={okCls}>{result}</p>}
        </div>
      )}
    </div>
  );
}
