import { useEffect, useRef, useState } from 'react';
import { EyeIcon } from '../components/EyeIcon';
import { useRfidScan, simulateScan } from '../hooks/useRfidScan';
import { registerMember, isValidKamar, normalizeKamar } from '../lib/api';
import { isValidUid, maskUid, normalizeUid } from '../lib/rfid';
import { ApiError } from '../lib/types';

/**
 * Kiosk pendaftaran mandiri: fullscreen, auto-focus, tahan salah fokus.
 * Scanner keyboard-wedge: tap kartu -> UID + Enter otomatis.
 * UID disensor (password) + tombol intip.
 */
export default function Register() {
  const [uid, setUid] = useState('');
  const [showUid, setShowUid] = useState(false);
  const [nama, setNama] = useState('');
  const [jekel, setJekel] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [kelas, setKelas] = useState('');
  const [kamar, setKamar] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const uidRef = useRef<HTMLInputElement>(null);

  // Auto-focus + jaga fokus tiap 3 detik (khas kiosk)
  useEffect(() => {
    uidRef.current?.focus();
    const t = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' || (document.activeElement as HTMLInputElement).type === 'search') uidRef.current?.focus();
    }, 3000);
    // Reset idle 60 detik
    let idle: number;
    const resetIdle = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => { setNama(''); setKelas(''); setKamar(''); setUid(''); setMsg(null); uidRef.current?.focus(); }, 60000);
    };
    window.addEventListener('pointerdown', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();
    return () => { clearInterval(t); window.clearTimeout(idle); window.removeEventListener('pointerdown', resetIdle); window.removeEventListener('keydown', resetIdle); };
  }, []);

  useRfidScan({
    enabled: true,
    onScan: (scanned) => {
      setUid(scanned);
      setMsg({ ok: true, text: `Kartu terbaca: ${maskUid(scanned)}. Lengkapi data lalu tekan Daftar.` });
      document.getElementById('reg-nama')?.focus();
    },
  });

  const submit = async () => {
    setMsg(null);
    const clean = normalizeUid(uid);
    if (!isValidUid(clean)) { setMsg({ ok: false, text: 'UID tidak valid. Tempelkan kartu pada scanner.' }); return; }
    if (!nama.trim() || !kelas.trim()) { setMsg({ ok: false, text: 'Nama dan kelas wajib diisi.' }); return; }
    if (!isValidKamar(kamar)) { setMsg({ ok: false, text: 'Format kamar salah. Contoh: 1-3-4' }); return; }
    setLoading(true);
    try {
      const m = await registerMember({ rfid_uid: clean, nama: nama.trim(), jekel, kelas: kelas.trim(), kamar: kamar.trim() });
      setMsg({ ok: true, text: `Berhasil! ID Anggota: ${m.id_anggota}. Kartu sudah aktif, silakan pinjam.` });
      setUid(''); setNama(''); setKelas(''); setKamar('');
      uidRef.current?.focus();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Pendaftaran gagal' });
    } finally { setLoading(false); }
  };

  const field = 'rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none placeholder:text-faint focus:border-brand';

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-surface shadow-sm">
      <div className="bg-brand-gradient h-2" />
      <div className="p-6">
        <h1 className="text-xl font-bold">Kiosk Pendaftaran Mandiri</h1>
        <p className="mt-1 text-sm text-muted">1. Tempelkan kartu RFID &nbsp;→&nbsp; 2. Isi data &nbsp;→&nbsp; 3. Tekan Daftar</p>

        <div className={`mt-4 rounded-xl border-2 border-dashed p-4 text-center ${uid && isValidUid(uid) ? 'border-brand bg-brand-soft' : 'border-line bg-surface-2'}`}>
          <p className="text-sm font-semibold">{uid && isValidUid(uid) ? '✓ Kartu terbaca (tersensor)' : 'Menunggu scan kartu…'}</p>
          <span className="relative mx-auto mt-2 inline-flex w-full max-w-xs">
            <input
              ref={uidRef}
              data-rfid="true"
              type={showUid ? 'text' : 'password'}
              value={uid}
              onChange={(e) => setUid(e.target.value.toUpperCase())}
              placeholder="Tempelkan kartu di sini"
              className={`rfid-input w-full pr-9 text-center font-mono text-lg tracking-widest ${field}`}
            />
            <button
              type="button"
              onClick={() => setShowUid((v) => !v)}
              title={showUid ? 'Sembunyikan UID' : 'Tampilkan UID'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
            >
              <EyeIcon off={showUid} className="h-5 w-5" />
            </button>
          </span>
          <span className="mt-2 block">
            <button onClick={() => simulateScan('DEADBEEF01')} className="text-xs text-faint underline">
              Simulasi scan (tanpa hardware)
            </button>
          </span>
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          <input id="reg-nama" className={field} placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} />
          <div className="flex gap-2">
            {(['Laki-laki', 'Perempuan'] as const).map((j) => (
              <button key={j} onClick={() => setJekel(j)} className={`flex-1 rounded-lg border px-3 py-2 ${jekel === j ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line text-muted'}`}>{j}</button>
            ))}
          </div>
          <input className={field} placeholder="Kelas (mis. XII-RPL)" value={kelas} onChange={(e) => setKelas(e.target.value)} />
          <input className={`${field} font-mono`} placeholder="Kamar (cth. 1-3-4)" value={kamar} onChange={(e) => setKamar(normalizeKamar(e.target.value))} inputMode="numeric" />
        </div>

        {msg && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-brand-soft text-ink' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'}`}>{msg.text}</p>}

        <button disabled={loading} onClick={submit} className="mt-4 w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60">
          {loading ? 'Mendaftar…' : 'Daftar'}
        </button>
      </div>
    </div>
  );
}
