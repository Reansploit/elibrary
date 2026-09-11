# Frontend — Perpustakaan Wonosalam (E-Library)

Front-end only (React + Vite + TypeScript + Tailwind). Back-end digarap tim
terpisah sesuai kontrak `openapi.yaml`. Folder ini di repo tampil sebagai
`frontend/` (nama lokal lama `web/` sudah di-rename).

## Jalankan

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173  (login mock: admin/123, petugas/123)
npm run build    # output statis di dist/ — siap dibungkus Tauri+Rust
```

## Mode Mock (default)

`VITE_API_MOCK=true` → semua API dimock di browser (localStorage), jadi
front-end bisa jalan & dites scanner RFID fisik tanpa back-end.
Ganti ke API asli:

```bash
VITE_API_MOCK=false
VITE_API_URL=http://localhost:3000/api
```

Lihat `.env.example`.

## Kontrak untuk tim back-end

Acuan wajib: **`openapi.yaml`** (v1.2.0) — auth JWT multi-role, stats
dashboard + filter range, CRUD buku + filter, members + RFID kiosk/lookup/
blacklist, checkout/checkin scan-ganda, setting durasi global, notifikasi,
portal anggota, ganti password.

Poin penting:

- Scanner RFID = keyboard-wedge (tap kartu → UID + Enter). UID valid: hex
  8–10 char; di UI selalu tampil tersensor (`••••XXXX`).
- Daftar mandiri via `/register` (kiosk, tanpa login). Rate-limit 10/mnt/IP.
- Field anggota: `kamar` format `angka-angka-angka` (cth. `1-3-4`),
  bukan nomor HP.
- Pengembalian wajib scan ulang kartu yang sama (`confirm_uid`).

## Struktur singkat

```
src/
  pages/       Dashboard, Members, Books (Data Buku + modal CRUD),
               Checkout (pinjam/kembali), Register (kiosk), Me (portal),
               Settings, Profile, Login
  components/  Layout, Notifications, ThemeToggle, BookModal, EyeIcon
  hooks/       useRfidScan (tangkap scan keyboard-wedge)
  lib/         api.ts (mock ↔ real), types.ts, rfid.ts
  mocks/       db.ts (seed + localStorage)
  store/       auth.ts, theme.ts (light/dark/system)
openapi.yaml   KONTRAK API
```
