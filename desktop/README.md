# E-Library Desktop (Tauri wrapper)

Window native (.exe) untuk aplikasi perpustakaan. Tidak berisi logika —
hanya splash pengatur server lalu membuka app web full-window
(navigasi top-level agar session login tetap jalan).

## Mode kios (v0.2.0+)

App dibuka langsung **fullscreen**. Tombol tutup (X), Alt+F4, dan
tutup via taskbar semuanya ditolak — tidak ada petunjuk apa pun di UI.

Catatan jujur: Task Manager Windows tetap bisa menghentikan proses.
Untuk penguncian total, gabungkan dengan Assigned Access / akun kios Windows.

## Agen Panel (v0.3.0+)

`agent.exe` — service ringan (Rust murni, tanpa runtime tambahan) untuk
dilapor ke Panel (`panel/`, port 3003):

- Enroll otomatis (MAC + hostname) saat pertama jalan, token tersimpan
  di `agent.json` sebelah exe.
- Heartbeat 30 detik: app buka/tutup, judul window aktif.
- Perintah remote: buka app, tutup app, restart agen.
- Autostart ditulis sendiri ke Registry Run saat pertama jalan.
- Log aktivitas di `agent.log` sebelah exe.

Pasang manual (cadangan):

```powershell
cd desktop\src-tauri
cargo build --release          # hasil: target\release\agent.exe
$dir = "$env:LOCALAPPDATA\elibrary-desktop"
copy target\release\agent.exe "$dir\"
copy ..\agent.json.example "$dir\agent.json"
notepad "$dir\agent.json"      # isi panel_url + app_path
& "$dir\agent.exe"             # jalan pertama kali (enroll)
```

Catatan: installer menaruh app di `%LOCALAPPDATA%\elibrary-desktop`
(per-user, tanpa perlu admin) — `agent.json`/`agent.log` ikut di sana,
sebelah exe.

Cek di Panel → menu Perangkat: PC muncul otomatis. Setelah itu agen
jalan sendiri tiap booting via autostart.

## Pasang otomatis (v0.3.0+)

Sejak v0.3.0 tidak perlu pasang manual: saat mengisi alamat server di
splash pertama kali, app otomatis menyalin `agent.exe`, menulis
`agent.json` (panel = host yang sama port 3003), mendaftarkan autostart,
dan menjalankan agen. Cara manual di atas tetap bisa dipakai cadangan.

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
