import { useEffect, useRef, useState } from 'react';
import { useRfidScan, simulateScan } from '../hooks/useRfidScan';
import { registerMember } from '../lib/api';
import { isValidUid, normalizeUid } from '../lib/rfid';
import { ApiError } from '../lib/types';

/**
 * Kiosk pendaftaran mandiri: fullscreen, auto-focus, tahan salah fokus.
 * Scanner keyboard-wedge: tap kartu -> UID + Enter otomatis.
 */
export default function Register() {
  const [uid, setUid] = useState('');
  const [nama, setNama] = useState('');
  const [jekel, setJekel] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [kelas, setKelas] = useState('');
  const [noHp, setNoHp] = useState('');
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
      idle = window.setTimeout(() => { setNama(''); setKelas(''); setNoHp(''); setUid(''); setMsg(null); uidRef.current?.focus(); }, 60000);
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
      setMsg({ ok: true, text: `Kartu terbaca: ${scanned}. Lengkapi data lalu tekan Daftar.` });
      document.getElementById('reg-nama')?.focus();
    },
  });

  const submit = async () => {
    setMsg(null);
    const clean = normalizeUid(uid);
    if (!isValidUid(clean)) { setMsg({ ok: false, text: 'UID tidak valid. Tempelkan kartu pada scanner.' }); return; }
    if (!nama.trim() || !kelas.trim()) { setMsg({ ok: false, text: 'Nama dan kelas wajib diisi.' }); return; }
    setLoading(true);
    try {
      const m = await registerMember({ rfid_uid: clean, nama: nama.trim(), jekel, kelas: kelas.trim(), no_hp: noHp.trim() });
      setMsg({ ok: true, text: `Berhasil! ID Anggota: ${m.id_anggota}. Kartu sudah aktif, silakan pinjam.` });
      setUid(''); setNama(''); setKelas(''); setNoHp('');
      uidRef.current?.focus();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Pendaftaran gagal' });
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Kiosk Pendaftaran Mandiri</h1>
      <p className="mt-1 text-sm text-slate-500">1. Tempelkan kartu RFID &nbsp;→&nbsp; 2. Isi data &nbsp;→&nbsp; 3. Tekan Daftar</p>

      <div className={`mt-4 rounded-xl border-2 border-dashed p-4 text-center ${uid && isValidUid(uid) ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50'}`}>
        <p className="text-sm font-semibold">{uid && isValidUid(uid) ? '✓ Kartu terbaca' : 'Menunggu scan kartu…'}</p>
        <input
          ref={uidRef}
          data-rfid="true"
          value={uid}
          onChange={(e) => setUid(e.target.value.toUpperCase())}
          placeholder="Tempelkan kartu di sini"
          className="rfid-input mx-auto mt-2 w-full max-w-xs rounded-lg border bg-white px-3 py-2 text-center font-mono text-lg tracking-widest outline-none focus:border-[#5cb86b]"
        />
        <button onClick={() => simulateScan('DEADBEEF01')} className="mt-2 text-xs text-slate-400 underline">
          Simulasi scan (tanpa hardware)
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <input id="reg-nama" className="rounded-lg border px-3 py-2 outline-none focus:border-[#5cb86b]" placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} />
        <div className="flex gap-2">
          {(['Laki-laki', 'Perempuan'] as const).map((j) => (
            <button key={j} onClick={() => setJekel(j)} className={`flex-1 rounded-lg border px-3 py-2 ${jekel === j ? 'border-[#5cb86b] bg-green-50 font-semibold text-green-700' : ''}`}>{j}</button>
          ))}
        </div>
        <input className="rounded-lg border px-3 py-2 outline-none focus:border-[#5cb86b]" placeholder="Kelas (mis. XII-RPL)" value={kelas} onChange={(e) => setKelas(e.target.value)} />
        <input className="rounded-lg border px-3 py-2 outline-none focus:border-[#5cb86b]" placeholder="No HP/WA" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
      </div>

      {msg && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{msg.text}</p>}

      <button disabled={loading} onClick={submit} className="mt-4 w-full rounded-xl bg-[#5cb86b] py-3 font-bold text-white hover:bg-[#45a055] disabled:opacity-60">
        {loading ? 'Mendaftar…' : 'Daftar'}
      </button>
    </div>
  );
}
