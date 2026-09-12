# E-Library Desktop (Tauri wrapper)

Window native (.exe) untuk aplikasi perpustakaan. Tidak berisi logika —
hanya splash pengatur server lalu membuka app web full-window
(navigasi top-level agar session login tetap jalan).

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

## Kembali ke versi lama

Semua perubahan tercatat di git. Untuk membatalkan:

```powershell
git log --oneline -- desktop        # lihat riwayat folder ini
git revert <commit>                 # batalkan commit tertentu, atau:
git checkout <commit> -- desktop    # kembalikan folder ke commit tertentu
```
