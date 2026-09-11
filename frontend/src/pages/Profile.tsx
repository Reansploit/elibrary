import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../lib/api';
import { ApiError } from '../lib/types';
import { useAuth } from '../store/auth';

export default function Profile() {
  const { nama, username, role, logout } = useAuth();
  const nav = useNavigate();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setMsg(null);
    if (newPw !== confirm) { setMsg({ ok: false, text: 'Konfirmasi password tidak sama.' }); return; }
    try {
      await changePassword(oldPw, newPw);
      setMsg({ ok: true, text: 'Password berhasil diganti ✓' });
      setOldPw(''); setNewPw(''); setConfirm('');
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Gagal ganti password' });
    }
  };

  const field = 'rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none placeholder:text-faint focus:border-brand';

  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-5">
      <div className="rounded-xl bg-surface p-5 text-center shadow-sm md:col-span-2">
        <img src="./logo.png" alt="avatar" className="mx-auto h-24 w-24 rounded-full border border-line object-cover" />
        <p className="mt-3 text-lg font-bold">{nama ?? 'Guest'}</p>
        <p className="text-sm text-muted">@{username ?? '-'}</p>
        <span className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-0.5 text-xs font-semibold text-brand">{role ?? '-'}</span>
        <p className="mt-3 text-xs text-faint">Perpustakaan Wonosalam<br />Wonosalam Boarding School</p>
        <button
          onClick={() => { logout(); nav('/login'); }}
          className="mt-4 w-full rounded-xl border border-line py-2 text-sm text-red-500 hover:bg-red-500/10 dark:text-red-400"
        >
          ⏻ Logout
        </button>
      </div>
      <div className="rounded-xl bg-surface p-5 shadow-sm md:col-span-3">
        <p className="text-sm font-bold">Ganti Password</p>
        <div className="mt-3 grid gap-2.5 text-sm">
          <input type="password" placeholder="Password lama" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className={field} />
          <input type="password" placeholder="Password baru (min. 4 karakter)" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={field} />
          <input type="password" placeholder="Konfirmasi password baru" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
          {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-brand-soft text-ink' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'}`}>{msg.text}</p>}
          <button onClick={submit} className="rounded-xl bg-brand py-2.5 font-bold text-white hover:bg-brand-dark">
            Simpan Password
          </button>
        </div>
      </div>
    </div>
  );
}
