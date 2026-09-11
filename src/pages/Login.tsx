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
    <div className="grid min-h-screen place-items-center bg-[#f4f5f6] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-center text-xl font-bold text-green-700">Sistem Informasi Perpustakaan</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Login System (mock: admin/123, petugas/123)</p>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#5cb86b]" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#5cb86b]" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#5cb86b] py-2 text-sm font-bold text-white hover:bg-[#45a055] disabled:opacity-60"
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
          <button className="w-full text-center text-xs text-slate-500 underline" onClick={() => nav('/register')}>
            Daftar mandiri via kiosk RFID
          </button>
        </div>
      </div>
    </div>
  );
}
