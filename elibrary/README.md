# E-Library — Sistem Perpustakaan Sekolah

Aplikasi perpustakaan digital untuk sekolah: kelola koleksi buku, anggota (RFID),
peminjaman–pengembalian, denda pembatasan, katalog publik, plus manajemen akun
berbasis role & permission.

Dibangun dengan Laravel + Inertia.js + React. Bahasa pengantar UI: Indonesia.

## Fitur utama

- **Dashboard** — statistik, aksi cepat, pencarian global (buku/anggota/pengguna),
  daftar terlambat & jatuh tempo
- **Buku** — CRUD, stok, foto sampul opsional, halaman status ketersediaan,
  halaman detail + riwayat peminjaman
- **Anggota** — CRUD + foto + RFID (bisa discan langsung di form pinjam),
  halaman detail + pinjaman aktif/riwayat
- **Sirkulasi** — pinjam (tanggal kembali otomatis dari pengaturan, bisa diubah),
  kembali, daftar terlambat; blokir otomatis untuk anggota yang dibatasi
  dan yang melewati batas pinjaman
- **Pembatasan** — sanksi non-materiil per anggota (centang + lama hari),
  tanpa denda uang
- **Katalog publik** (`/katalog`) — pencarian buku tanpa login + halaman semua buku
- **Pengaturan** — nama app, aturan pinjam, akun pengguna, role & izin
- **Akses berbasis izin** — menu abu otomatis + URL langsung ditolak bila tak berizin

## Teknologi

| Lapis | Pakai |
|---|---|
| Backend | PHP ^8.3, Laravel ^13 |
| Frontend | React 19, Inertia.js 2, Tailwind CSS 4, Vite |
| Database | **MySQL/MariaDB** (wajib — migrasi memakai SQL khusus MySQL) |
| Izin | `spatie/laravel-permission` |

## Syarat

- PHP 8.3 + extension: `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, **`intl`**
- Composer, Node.js + npm, MySQL/MariaDB berjalan

## Instalasi baru

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Sesuaikan `.env` (minimal `DB_*`, `APP_URL`), lalu:

```bash
php artisan migrate --force
php artisan db:seed --force   # role, permission, akun admin
php artisan storage:link
npm install
npm run build                 # atau `npm run dev` saat development
php artisan serve
```

Login awal: username `admin` / password `123` — langsung ganti setelah masuk.

## Pindah server / database lama

- Salin semua file **kecuali** `.env` (buat baru dari `.env.example`),
  lalu ikuti langkah instalasi di atas.
- Migrasi lama dibuat toleran terhadap skema warisan (tidak menghapus data),
  tapi **backup database dulu** sebelum `migrate`.
- `storage/app/public` berisi foto upload — ikut disalin bila ingin foto tetap ada
  (atau jalankan `storage:link` ulang + upload ulang).

## Troubleshooting (kasus nyata yang pernah terjadi)

| Gejala | Penyebab & solusi |
|---|---|
| `MissingAppKeyException` | `.env` belum ada / `APP_KEY` kosong → copy `.env.example`, `key:generate` |
| `headers already sent` setelah error lain | Efek domino — baca error **pertama** di `storage/logs/laravel.log` |
| `SQLSTATE[HY000] [2002] ... refused` | MySQL mati / `DB_PORT` salah (standar `3306`) / kredensial salah |
| `Table '....settings' doesn't exist` | Migrasi belum jalan → `migrate --force` |
| `Unknown column ...` saat migrate di DB lama | Skema warisan beda versi — migrasi sudah dibuat toleran, update kode ke versi terbaru lalu migrate ulang |
| `Undefined variable $today` (dashboard) | Bug versi lama — update kode |
| `intl extension required` | Aktifkan `extension=intl` di `php.ini`, restart server |
| Upload foto "failed to upload" | Limit PHP `upload_max_filesize` (default 2M) — app mengkompresi otomatis di browser; untuk file besar naikkan limit server |
| Halaman putih setelah `git pull` | `public/build` tidak ikut repo — jalankan `npm run build` (atau `npm run dev`) di server |

## Struktur singkat

```
app/Http/Controllers/   # Dashboard, Book, Member, Circulation, Sanksi,
                        #   Search, Katalog, Settings (+Controller dasar:
                        #   ensureCan, storePhoto)
app/Models/             # Book, Member, Circulation, LoanLog, User, Setting
routes/web.php          # rute auth + /katalog publik
resources/js/Pages/     # halaman Inertia per modul
resources/js/components/# komponen UI bersama (tombol, tabel, dialog, search…)
database/migrations/    # rantai migrasi (MySQL only)
public/bahan/           # aset gambar publik (foto gedung, logo)
```
