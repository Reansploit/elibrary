# LunarAgent (Python)

Agen Panel Perpus versi Python — stdlib only, tanpa dependensi.
Hasil build **tetap 1 file** `LunarAgent.exe` (via PyInstaller).

## Build (di Windows, sekali saja siapkan)

1. Install Python 3.10+ dari python.org (centang **Add python.exe to PATH**)
2. Dobel-klik `build-agent.bat` di folder ini
3. Hasil: `dist\LunarAgent.exe` → timpa ke PC / ke `panel/public/rilis/`

## Pasang di PC client

Sama seperti agen Rust: taruh sebelah app, jalankan sekali sebagai
Administrator (enroll + autostart), habis itu jalan diam-diam.
Config `lunaragent.json` + log `lunaragent.log` formatnya sama persis,
jadi bisa tukar-tukar dengan versi Rust tanpa setting ulang.

## Catatan jujur

- Source `.py` kalau ditaruh mentah BISA dibaca santri — yang dipasang
  harus selalu hasil build `.exe`, jangan file `.py`-nya.
- Defender/SmartScreen kadang curiga pada exe PyInstaller sekali pertama
  (baru dikenal). Klik More info > Run anyway, atau Laporkan + whitelist.
