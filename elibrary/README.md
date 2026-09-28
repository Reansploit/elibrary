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

## Jenis koleksi

Setiap buku punya kolom `jenis` dengan nilai `buku` atau `ebook`. Nilai ini dipilih saat menambah atau mengubah data, tampil di daftar, detail, dan katalog. Menu **Ebook** memakai route `ebooks.index` yang memakai data yang sama dengan tabel `tb_buku`, jadi tidak ada duplikasi data.

## Preview reader

Halaman `Books/Show` sekarang memiliki tombol **Pratinjau reader**. Route `books.preview` merender demo Document IR v0.1 memakai renderer web dari Reo-Engine. Ini slice visual untuk menguji reflow, ukuran teks, dan tema sebelum file PDF disambungkan.

Build lokal memakai checkout engine di folder saudara secara default:

```text
D:/Job/elibrary/elibrary
D:/Job/Reo-Engine
```

Jika folder engine berada di lokasi lain, set `REO_ENGINE_PATH` sebelum menjalankan Vite:

```powershell
$env:REO_ENGINE_PATH = 'D:/path/ke/Reo-Engine'
npm run build
```

Pratinjau ini memakai Document IR demo dan terpisah dari file PDF yang diunggah. Preview engine tetap berguna untuk menguji renderer tanpa biaya ekstraksi seluruh buku.

## Upload dan baca ebook

Pada form Ebook, field **Lokasi / rak** dan jumlah eksemplar fisik disembunyikan. File PDF wajib dipilih dengan batas 50 MB. File disimpan pada disk `local` di `storage/app/private/ebooks`, tidak diekspos langsung melalui `public/`.

Route `books.file` hanya dapat diakses pengguna yang sudah login dan punya izin buku. Viewer `books.read` memiliki dua mode di bagian atas. **Original** merender PDF persis melalui PDF.js. **Reo-Engine** mengambil text run dan image operator dari PDF.js, meneruskannya ke `@reo-engine/parser-pdf` untuk menghasilkan page analysis, lalu merender IR dengan `@reo-engine/renderer-web`. Halaman tanpa layer teks, misalnya cover gambar atau hasil scan, hanya tersedia pada mode Original. Vite menyalin asset decoder, CMaps, font standar, dan ICC ke `public/build/pdfjs` otomatis; folder tersebut tidak ikut repo. Saat mode dev, URL asset dikirim dari origin Laravel agar request WASM tidak diproses Vite.

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
