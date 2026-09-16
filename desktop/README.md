# E-Library Desktop (Tauri wrapper)

Window native (.exe) untuk aplikasi perpustakaan. Tidak berisi logika —
hanya splash pengatur server lalu membuka app web full-window
(navigasi top-level agar session login tetap jalan).

## Mode kios (v0.2.0+)

App dibuka langsung **fullscreen**. Tombol tutup (X), Alt+F4, dan
tutup via taskbar semuanya ditolak — tidak ada petunjuk apa pun di UI.

Catatan jujur: Task Manager Windows tetap bisa menghentikan proses.
Untuk penguncian total, gabungkan dengan Assigned Access / akun kios Windows.

## Bangun installer (di Windows)

```powershell
cd desktop
npm install
npm run tauri icon "D:\New folder\elibrary\elibrary-main\elibrary\public\images\logo-wbs.png"
npm run tauri build
```

Hasil: `src-tauri\target\release\bundle\` (`.exe` + installer `.msi`/nsis).

Prasyarat sekali saja: Node.js LTS + Rust (`rustup-init.exe`)
+ Visual Studio Build Tools workload C++.

## Rilis update wrapper

1. Naikkan versi di 3 tempat: `dist/index.html` (`WRAPPER_VERSION`),
   `src-tauri/tauri.conf.json` (`version`), `src-tauri/Cargo.toml` (`version`)
2. Build ulang seperti di atas, bagikan installer ke PC client
3. Di server, isi `elibrary/public/wrapper-version.json`:
   `version` baru + `download_url` installer + `notes` opsional —
   splash di client otomatis menawarkan update

## Kembali ke versi lama

Semua perubahan tercatat di git. Untuk membatalkan:

```powershell
git log --oneline -- desktop        # lihat riwayat folder ini
git revert <commit>                 # batalkan commit tertentu, atau:
git checkout <commit> -- desktop    # kembalikan folder ke commit tertentu
```
