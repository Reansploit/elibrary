# Panel Perpus Desktop (Tauri wrapper)

Window native (.exe) untuk Panel kontrol perangkat. Seperti wrapper
E-Library: splash pengatur server lalu membuka app web full-window.
Tanpa mode kios — window normal, bisa ditutup biasa.

Server default: host yang sama port **3003**.

## Bangun installer (di Windows)

```powershell
cd panel-desktop
npm install
npm run tauri icon "..\elibrary\public\images\logo-wbs.png"
npm run tauri build
```

Hasil: `src-tauri\target\release\bundle\` (`.exe` + installer `.msi`/nsis).

## Rilis update wrapper

Naikkan versi di 3 tempat: `dist/index.html` (`WRAPPER_VERSION`),
`src-tauri/tauri.conf.json` (`version`), `src-tauri/Cargo.toml` (`version`).
