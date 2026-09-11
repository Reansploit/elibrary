import { useEffect, useRef } from 'react';
import { isValidUid, looksLikeScan, normalizeUid } from '../lib/rfid';

interface Options {
  /** Matikan listener saat form lain fokus (misal search buku). */
  enabled?: boolean;
  /** Panjang minimal UID, default 8. */
  minLength?: number;
  /** Callback saat scan terdeteksi. */
  onScan: (uid: string) => void;
  /** Jika true, cegah Enter submit form saat scan. Default true. */
  captureEnter?: boolean;
}

/**
 * Tangkap scan RFID keyboard-wedge di level window.
 * Bekerja untuk scanner USB HID maupun mode Tauri WebView nanti
 * karena keduanya sama-sama mengirim keystroke + Enter.
 *
 * Cara pakai:
 *   useRfidScan({ enabled: step==='identify', onScan: (uid)=>lookup(uid) })
 *
 * Untuk dev tanpa hardware: panggil simulateScan(uid) dari tombol.
 */
export function useRfidScan({ enabled = true, minLength = 8, onScan, captureEnter = true }: Options) {
  const buf = useRef('');
  const times = useRef<number[]>([]);
  const lastKey = useRef(0);
  const cb = useRef(onScan);
  cb.current = onScan;

  useEffect(() => {
    if (!enabled) return;
    buf.current = '';
    times.current = [];

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Jangan ganggu saat user mengetik di search/select/textarea khusus
      // kecuali input itu sendiri bertanda data-rfid="true".
      const tag = target?.tagName;
      const isRfidField = target?.getAttribute?.('data-rfid') === 'true';
      const isEditable =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;
      if (isEditable && !isRfidField) {
        // Tetap dengarkan Enter-terminated burst dari scanner yang fokus di mana saja?
        // Tidak — agar search buku tidak keganggu, abaikan bila fokus di field lain
        // dan key bukan bagian dari field RFID.
        // Scanner di kiosk/register selalu diarahkan ke field RFID via auto-focus.
        return;
      }

      const now = performance.now();
      if (e.key === 'Enter') {
        const raw = buf.current;
        buf.current = '';
        const intervals = times.current;
        times.current = [];
        if (raw.length >= minLength && looksLikeScan(intervals, raw.length)) {
          const uid = normalizeUid(raw);
          if (isValidUid(uid)) {
            if (captureEnter) e.preventDefault();
            cb.current(uid);
          }
        }
        return;
      }
      // Hanya kumpulkan karakter cetak, abaikan modifier
      if (e.key.length === 1) {
        if (lastKey.current) times.current.push(now - lastKey.current);
        lastKey.current = now;
        buf.current += e.key;
        // Batas aman buffer
        if (buf.current.length > 64) {
          buf.current = buf.current.slice(-64);
          times.current = times.current.slice(-64);
        }
        // Reset buffer jika jeda > 500ms (ketikan manual terputus)
        window.clearTimeout((onKey as unknown as { _t?: number })._t);
        (onKey as unknown as { _t?: number })._t = window.setTimeout(() => {
          buf.current = '';
          times.current = [];
        }, 500);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, minLength, captureEnter]);
}

/** Tombol "Simulasi Scan" untuk dev/demo tanpa hardware. */
export function simulateScan(uid: string) {
  const clean = uid.trim();
  for (const ch of clean) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
  }
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
}
