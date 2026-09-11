import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/api';
import type { AppNotification } from '../lib/types';

const kindIcon: Record<AppNotification['kind'], string> = {
  overdue: '⏰',
  stock: '📦',
  fee: '💰',
  member: '👤',
};

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(AppNotification & { read: boolean })[]>([]);
  const nav = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  const load = () => getNotifications().then(setItems);
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open ]);

  const unread = items.filter((i) => !i.read).length;

  return (
    <div ref={boxRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2"
        aria-label="Notifikasi"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="text-sm font-bold">Notifikasi {unread > 0 && <span className="text-xs font-normal text-faint">({unread} belum dibaca)</span>}</p>
            <button
              className="text-xs text-brand underline"
              onClick={async () => { await markAllNotificationsRead(); load(); }}
            >
              Tandai dibaca
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-faint">Tidak ada notifikasi 🎉</p>}
            {items.map((n) => (
              <button
                key={n.id}
                className={`flex w-full items-start gap-2.5 border-b border-line px-3 py-2.5 text-left text-sm hover:bg-surface-2 ${n.read ? 'opacity-60' : 'bg-brand-soft/50'}`}
                onClick={async () => {
                  await markNotificationRead(n.id);
                  setOpen(false);
                  nav(n.link);
                }}
              >
                <span className="text-lg">{kindIcon[n.kind]}</span>
                <span>
                  <span className="block font-semibold">{n.title}</span>
                  <span className="block text-xs text-muted">{n.desc}</span>
                </span>
                {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
