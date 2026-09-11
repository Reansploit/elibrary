import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import Notifications from './Notifications';
import ThemeToggle from './ThemeToggle';

// Urutan sidebar: Settings paling bawah (krusial), Profile tepat di atasnya.
const items = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/members', label: 'Members', icon: '⛉' },
  { to: '/books', label: 'Data Buku', icon: '▤' },
  { to: '/checkout', label: 'Check-out Books', icon: '◍' },
  { to: '/me', label: 'Portal Anggota', icon: '⛀' },
  { to: '/register', label: 'Kiosk Daftar', icon: '＋' },
  { to: '/profile', label: 'Profile', icon: '⛀' },
  { to: '/settings', label: 'Settings', icon: '⛭' },
];

function ProfileMenu() {
  const { nama, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open ]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 font-medium">
        <img src="./logo.png" alt="avatar" className="h-7 w-7 rounded-full border border-line object-cover" />
        {nama ?? 'Guest'} <span className="text-xs text-faint">▾ {role ?? ''}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 text-sm shadow-lg">
          <button className="block w-full px-3 py-2 text-left hover:bg-surface-2" onClick={() => { setOpen(false); nav('/profile'); }}>
            👤 Profile Saya
          </button>
          <button className="block w-full px-3 py-2 text-left hover:bg-surface-2" onClick={() => { setOpen(false); nav('/settings'); }}>
            ⛭ Settings
          </button>
          <div className="border-t border-line">
            <button
              className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-500/10 dark:text-red-400"
              onClick={() => { logout(); nav('/login'); }}
            >
              ⏻ Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <button className="flex items-center gap-2 font-bold" onClick={() => nav('/')}>
          <img src="./logo.png" alt="Perpustakaan Wonosalam" className="h-8 w-8 rounded-md border border-line object-cover" />
          <span className="hidden sm:inline">Perpustakaan Wonosalam</span>
          <span className="sm:hidden">PW</span>
        </button>
        <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm text-muted sm:flex">
          <span>⌕</span>
          <input
            placeholder="Search Ex. ISBN, Title, Author, Member, etc"
            className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
            onKeyDown={(e) => {
              if (e.key === 'Enter') nav(`/books?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-sm">
          <ThemeToggle />
          <Notifications />
          <ProfileMenu />
        </div>
      </header>
      <div className="mx-auto flex max-w-[1280px] gap-4 p-4">
        <aside className="hidden w-52 shrink-0 flex-col gap-1 md:flex">
          <nav className="rounded-xl bg-surface p-2 shadow-sm">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-brand font-semibold text-white' : 'text-muted hover:bg-surface-2 hover:text-ink'}`
                }
              >
                <span className="w-5 text-center">{it.icon}</span> {it.label}
              </NavLink>
            ))}
            <div className="mt-1 border-t border-line pt-1 text-sm text-muted">
              <span className="block px-3 py-1.5">ⓘ Help</span>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-red-500 hover:bg-red-500/10 dark:text-red-400"
                onClick={() => { logout(); nav('/login'); }}
              >
                ⏻ Logout
              </button>
            </div>
          </nav>
          <div className="mt-3 rounded-xl border border-dashed border-brand/50 bg-brand-soft p-3 text-xs text-muted">
            <b className="text-ink">Mode Mock aktif.</b> Data tersimpan di browser (localStorage). Ganti ke API asli via <code>VITE_API_MOCK=false</code> + <code>VITE_API_URL</code>.
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-line bg-surface py-2 text-xs md:hidden">
        {items.slice(0, 5).map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} className="flex flex-col items-center gap-0.5 text-muted">
            <span className="text-base">{it.icon}</span>{it.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
      <div className="h-14 md:hidden" />
    </div>
  );
}
