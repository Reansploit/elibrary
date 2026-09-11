import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

const items = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/members', label: 'Members', icon: '⛉' },
  { to: '/books', label: 'Add Books', icon: '▤' },
  { to: '/checkout', label: 'Check-out Books', icon: '◍' },
  { to: '/me', label: 'Portal Anggota', icon: '⛀' },
  { to: '/settings', label: 'Settings', icon: '⛭' },
  { to: '/register', label: 'Kiosk Daftar', icon: '＋' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { nama, role, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-[#f4f5f6] text-slate-800">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#eef0f3] bg-white px-4 py-2.5">
        <div className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[#5cb86b] text-white">≡</span>
          Library App
        </div>
        <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 sm:flex">
          <span>⌕</span>
          <input
            placeholder="Search Ex. ISBN, Title, Author, Member, etc"
            className="w-full bg-transparent outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') nav(`/books?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden rounded-full border px-3 py-1 text-slate-500 md:inline">📅 Last 6 months ▾</span>
          <span>🔔</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200">👤</span>
            {nama ?? 'Guest'} <span className="text-xs text-slate-400">▾ {role ?? ''}</span>
          </span>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1280px] gap-4 p-4">
        <aside className="hidden w-52 shrink-0 flex-col gap-1 md:flex">
          <nav className="rounded-xl bg-white p-2 shadow-sm">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-[#5cb86b] font-semibold text-white' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                <span className="w-5 text-center">{it.icon}</span> {it.label}
              </NavLink>
            ))}
            <div className="mt-1 border-t pt-1 text-sm text-slate-500">
              <span className="block px-3 py-1.5">ⓘ Help</span>
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-red-500 hover:bg-red-50 rounded-lg"
                onClick={() => { logout(); nav('/login'); }}
              >
                ⏻ Logout
              </button>
            </div>
          </nav>
          <div className="mt-3 rounded-xl border border-dashed border-[#5cb86b]/50 bg-green-50 p-3 text-xs text-slate-600">
            <b>Mode Mock aktif.</b> Data tersimpan di browser (localStorage). Ganti ke API asli via <code>VITE_API_MOCK=false</code> + <code>VITE_API_URL</code>.
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-white py-2 text-xs md:hidden">
        {items.slice(0, 5).map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} className="flex flex-col items-center gap-0.5 text-slate-600">
            <span className="text-base">{it.icon}</span>{it.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
      <div className="h-14 md:hidden" />
    </div>
  );
}
