# Reader Book Mode & Fullscreen

Dokumen ini menjelaskan apa yang **baru** di `resources/js/Pages/Reader/Pdf.jsx`
dibanding versi sebelumnya, dan kenapa Reo-Engine sendiri tidak ikut berubah.

---

## Ringkasan

| Fitur | Status | Sumber perubahan |
|---|---|---|
| Mode **Buku** (2 halaman jadi 1 spread) | Baru | elibrary |
| Mode **Tunggal** (seperti sebelumnya) | Dipertahankan | elibrary |
| **Layar penuh** (fullscreen) | Baru | elibrary |
| **Paskan ke layar** (auto-fit) | Baru | elibrary |
| Gutter/shadow antar halaman | Baru | elibrary |
|_Otomatis fallback ke Tunggal di HP_ | Baru | elibrary |
| Mode **Original** / **Reo-Engine** | Tidak berubah | — |
| `@reo-engine/renderer-web` | **Tidak berubah** | — |

---

## Apakah Reo-Engine berubah?

**Tidak. Nol perubahan di repo Reo-Engine untuk fitur ini.**

Alasannya: `mountAdaptivePage(overlay, canvas, analysis, options)` sudah
bersifat *per-canvas* dan *stateless*. Ia tidak menyimpan state antar halaman,
jadi spread dua halaman hanyalah **dua pemanggilan terpisah**, masing-masing
dengan canvas dan `PdfPageAnalysis`-nya sendiri.

Dengan kata lain: **spread adalah urusan komposisi halaman aplikasi, bukan
konten dokumen.** Layering Reo-Engine (Parser → IR → Analysis → Style →
Renderer) tidak tersentuh.

Yang *memang* berubah di sisi engine adalah dari commit sebelumnya
(`835e08e`), bukan dari fitur ini:

- `mountAdaptivePage` ditambahkan
- `parser-pdf` mendapat `graphicRegions` dan `rasterCoverage`

---

## Yang baru, satu per satu

### 1. Mode Buku (spread)

Dua halaman berdampingan seperti buku yang terbuka. Navigasi melompat 2 halaman
sekali, dan label berubah jadi rentang, mis. `1–2 / 226`.

- Pasangan halaman: `(1,2)`, `(3,4)`, …, `(225,226)`
- Spread terakhir otomatis dijepit supaya tidak keluar rentang dokumen
- Setiap halaman punya canvas + overlay adaptive sendiri

### 2. Layar penuh

Tombol layar penuh di toolbar, memakai Fullscreen API bawaan browser.

- Sidebar dan chrome aplikasi ikut hilang
- Kontrol navigasi tetap tersedia karena ikut masuk elemen fullscreen
- Keluar lewat tombol lagi atau `Esc` (perilaku native browser)
- Ukuran kanvas dihitung ulang otomatis karena `ResizeObserver` mendeteksi perubahan ukuran container

### 3. Paskan ke layar (auto-fit)

Sebelumnya skala halaman selalu `100%` dan halaman besar bisa melebihi layar.
Sekarang skala dihitung agar halaman muat, dibatasi `20%`–`200%`.

- Spread ikut dihitung: dua halaman dihitung sebagai satu lebar
- Tombol `↺` sekarang berarti "paskan ke layar", bukan "kembali ke 100%"
- Setelah menekan `+`/`-` zoom manual, tombol `↺` aktif kembali untuk mengembalikan auto-fit

### 4. Gutter antar halaman

Shadow tipis di tepi kanan halaman kiri supaya dua halaman terbaca sebagai satu
lembaran yang terlipat, bukan dua gambar yang ditempel.

### 5. Fallback otomatis di layar sempit

Di bawah 768px tombol Tata Letak disembunyikan dan mode dipaksa menjadi
Tunggal. Dua halaman di layar HP tidak akan terbaca, jadi fallback ini
sengaja dibuat otomatis, bukan diserahkan ke user.

---

## Yang **tidak** berubah (sengaja)

- **Posisi halaman tetap sama persis.** Tidak ada reflow. Book mode hanya
  komposisi, bukan perubahan tata letak dokumen.
- **Original vs Reo-Engine tetap orthogonal.** Keempat kombinasi works:
  Tunggal+Original, Tunggal+Reo, Buku+Original, Buku+Reo.
- **Gambar tetap `PreserveOriginal`.** Book mode tidak menyentuh sama sekali
  kebijakan region di engine.
- **Halaman scan tetap utuh.** `rasterCoverage` masih berlaku per halaman, jadi
  buku hasil scan seperti *Color And Light* tetap tampil apa adanya di kedua
  mode.

---

## Cara memakai

Toolbar atas, kiri:

- `Tunggal` / `Buku` — ganti tata letak
- Ikon layar penuh — masuk/keluar layar penuh

Toolbar atas, kanan: tombol layar penuh.

Toolbar kedua: navigasi halaman + zoom (`−` `+` `↺` paskan ke layar).

---

## Detail teknis

File: `resources/js/Pages/Reader/Pdf.jsx`

**Komponen baru `PageSlot`.** Satu slot = satu halaman. Menangani render
canvas, overlay adaptive, dan pembersihannya sendiri. Ini memecah tanggung
jawab yang sebelumnya semua menumpuk di komponen induk, dan yang membuat spread
menjadi perubahan kecil.

**Skala.**

```js
const scale = userScale ?? fitScale;
```

`userScale` bernilai `null` sampai user menekan zoom. Selama `null`, skala
mengikuti `fitScale` yang dihitung `ResizeObserver` dari tinggi dan lebar
container.

**Lazy spread.** `isNarrow` mematikan spread, jadi `visiblePages` selalu
length 1 di HP. Tidak perlu branch tambahan di mana-mana.

**Rerender saat pindah halaman.** `analysisVersion` dinaikkan hanya kalau
halaman yang sedang terlihat selesai dianalisis, supaya tidak mount ulang
overlay untuk 226 halaman.

---

## Cara menguji

```powershell
cd D:\Job\elibrary\elibrary
$env:REO_ENGINE_PATH = 'D:\Job\Reo-Engine'
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Buka `http://127.0.0.1:8000/books/BKA-001/read`, lalu cek:

1. Klik `Buku` → dua halaman muncul, label jadi `1–2 / 226`
2. Klik `→` → label jadi `3–4 / 226`
3. Tekan `↺` → halaman pas ke layar
4. Klik ikon layar penuh → sidebar hilang
5. Klik `Buku` + `Reo-Engine` → dua halaman tetap tampil utuh
6. Perkecil jendela di bawah 768px → tombol tata letak hilang, kembali Tunggal
7. Klik `→` sampai habis → spread terakhir `225–226`, tombol `→` nonaktif
