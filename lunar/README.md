# LUNAR — Local Unified Network Agent Remote

Aplikasi desktop guru untuk memantau dan mengendalikan PC perpustakaan.
Berbicara ke Panel lewat JSON API (`/api/v1/manager`, token Sanctum).

Struktur: **LUNAR** (platform) → **LUNAR Module** (modul ini:
monitoring + remote) → **lunarAI** (rencana modul cerdas).

## Bangun installer (di Windows)

```powershell
cd lunar
npm install
npm run tauri icon "..\elibrary\public\images\logo-wbs.png"
npm run tauri build
```

Hasil: `src-tauri\target\release\bundle\` (`.exe` + installer `.msi`/nsis).

## Pakai

1. Buka app → isi alamat server Panel (`http://IP-server:3003`)
2. Login akun guru → dashboard update tiap 15 detik
3. Klik baris PC → rename, perintah remote, alert, linimasa

## Rilis update

Naikkan versi di 3 tempat: `package.json`, `dist/index.html` (tidak ada
versi di UI — lewati), `src-tauri/tauri.conf.json` (`version`),
`src-tauri/Cargo.toml` (`version`).
