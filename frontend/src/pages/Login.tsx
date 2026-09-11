import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import { ApiError } from '../lib/types';
import { useAuth } from '../store/auth';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-surface shadow-sm">
        <div className="bg-brand-gradient h-2" />
        <div className="p-6">
          <img src="./logo.png" alt="Perpustakaan Wonosalam" className="mx-auto h-20 w-20 rounded-xl border border-line object-cover" />
          <h1 className="mt-3 text-center text-xl font-bold text-brand">Perpustakaan Wonosalam</h1>
          <p className="text-center text-xs text-muted">Wonosalam Boarding School</p>
          <p className="mt-1 text-center text-sm text-muted">Login System (mock: admin/123, petugas/123)</p>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-brand" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-brand" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {err && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">{err}</p>}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
              onClick={async () => {
                setLoading(true); setErr('');
                try {
                  const r = await login(username, password);
                  auth.login({ token: r.accessToken, nama: r.user.nama, username: r.user.username, role: r.user.role });
                  nav('/');
                } catch (e) {
                  setErr(e instanceof ApiError ? e.message : 'Login gagal');
                } finally { setLoading(false); }
              }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
            <button className="w-full text-center text-xs text-muted underline" onClick={() => nav('/register')}>
              Daftar mandiri via kiosk RFID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
