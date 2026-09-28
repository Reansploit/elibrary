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

Dua halaman berdampingan seperti buku yang terbuka, dengan pasangan halaman
ala buku cetak: **halaman 1 berdiri sendiri** sebagai sampul, lalu pasangan
genap-ganjil.

```
halaman 1        →  sampul, sendirian
halaman 2 – 3    →  spread
halaman 4 – 5    →  spread
halaman 6 – 7    →  spread
...
halaman 224–225  →  spread
halaman 226      →  halaman terakhir, sendirian
```

- Label berubah jadi rentang, mis. `2–3 / 226`
- Halaman ganjil terakhir berdiri sendiri otomatis
- Setiap halaman punya canvas + overlay adaptive sendiri

### 2. Layar penuh

Tombol layar penuh di toolbar, memakai Fullscreen API bawaan browser.

- Sidebar dan chrome aplikasi ikut hilang
- **Toolbar disembunyikan otomatis** supaya tidak mengganggu pandangan
- Muncul **dua tombol kecil di kanan bawah**:
  - ikon `SlidersHorizontal` untuk memunculkan toolbar
  - ikon `Minimize2` untuk keluar dari layar penuh
- Ikon `SlidersHorizontal` berubah jadi `X` saat toolbar sedang tampil
- Keluar lewat tombol kecil, tombol layar penuh di toolbar, atau `Esc` (perilaku native browser)
- Ukuran kanvas dihitung ulang otomatis karena `ResizeObserver` mendeteksi perubahan ukuran container

### 3. Paskan ke layar (auto-fit) dan zoom di kedua mode

Sebelumnya skala halaman selalu `100%` dan halaman besar bisa melebihi layar.
Sekarang skala dihitung agar halaman muat, dibatasi `20%`–`200%`.

- Spread ikut dihitung: dua halaman dihitung sebagai satu lebar
- Tombol `↺` sekarang berarti "paskan ke layar", bukan "kembali ke 100%"
- Setelah menekan `+`/`-` zoom manual, tombol `↺` aktif kembali untuk mengembalikan auto-fit
- **Zoom sekarang bisa dipakai di mode Reo-Engine juga.** Sebelumnya kontrol
  zoom sengaja disembunyikan di mode engine karena tempatnya dipakai untuk
  teks progres analisis. Sekarang progres dipindah ke sebelah kontrol zoom,
  jadi `+` / `-` / `↺` tersedia di Original maupun Reo-Engine.
- Batas zoom manual tetap `60%`–`200%`. Auto-fit boleh turun sampai `20%`.

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

Toolbar kedua: navigasi halaman + zoom (`−` `+` `↺` paskan ke layar). Ketiganya
berfungsi di mode Original maupun Reo-Engine.

Di dalam layar penuh:

- Toolbar disembunyikan
- Dua tombol kecil kanan bawah: `SlidersHorizontal` (tampilkan toolbar) dan
  `Minimize2` (keluar layar penuh)
- Tombol `SlidersHorizontal` berubah jadi `X` saat toolbar tampil, untuk
  menyembunyikannya lagi

Tombol keluar sengaja diletakkan terpisah dari toggle toolbar. Kalau hanya ada
satu tombol, pengguna yang menyembunyikan toolbar tidak punya jalan keluar dari
layar penuh kecuali mengandalkan `Esc` — dan `Esc` tidak bisa diandalkan di
semua browser.

---

## Detail teknis

File: `resources/js/Pages/Reader/Pdf.jsx`

**Komponen baru `PageSlot`.** Satu slot = satu halaman. Menangani render
canvas, overlay adaptive, dan pembersihannya sendiri. Ini memecah tanggung
jawab yang sebelumnya semua menumpuk di komponen induk, dan yang membuat spread
menjadi perubahan kecil.

**Pasangan halaman ala buku.**

```js
const stepFrom = (current, direction) => {
    if (!spread) return current + direction;
    if (direction > 0) return current <= 1 ? 2 : current + 2;
    return current <= 2 ? 1 : current - 2;
};
```

`visiblePages` mengembalikan `[1]` untuk sampul, `[genap, genap+1]` untuk isi,
dan satu elemen lagi kalau halaman berikutnya melewati `numPages`. `lastLeftPage`
dijepit supaya navigasi tidak keluar dokumen.

**Skala.**

```js
const scale = userScale ?? fitScale;
```

`userScale` bernilai `null` sampai user menekan zoom. Selama `null`, skala
mengikuti `fitScale` yang dihitung `ResizeObserver` dari tinggi dan lebar
container. `fitScale` ikut memperhitungkan jumlah halaman yang tampil, jadi
spread dihitung sebagai satu lebar gabung.

**Lazy spread.** `isNarrow` mematikan spread, jadi `visiblePages` selalu
length 1 di HP. Tidak perlu branch tambahan di mana-mana.

**Toolbar fullscreen.** Toolbar tetap di DOM, hanya diberi class `hidden` saat
`isFullscreen && !showFullscreenControls`. State `showFullscreenControls`
selalu direset `false` saat masuk fullscreen, supaya layar penuh berikutnya
selalu bersih.

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

**Pasangan halaman**

1. Klik `Buku` → **satu** halaman tampil, label `1 / 226`
2. Klik `→` → dua halaman, label `2–3 / 226`
3. Klik `→` → label `4–5 / 226`
4. Klik `←` → balik ke `2–3 / 226`, lalu ke `1 / 226`
5. Klik `→` sampai habis → halaman terakhir `226 / 226` berdiri sendiri

**Zoom di Reo-Engine**

6. Klik `Reo-Engine`, tunggu progres selesai
7. Tekan `+` beberapa kali → persentase naik, halaman membesar
8. Tekan `↺` → kembali pas ke layar

**Layar penuh**

9. Klik ikon layar penuh → sidebar dan toolbar hilang, tersisa tombol kecil kanan bawah
10. Klik tombol kecil → toolbar muncul
11. Klik `X` → toolbar hilang lagi
12. Klik tombol layar penuh → keluar

**Layar sempit**

13. Perkecil jendela di bawah 768px → tombol tata letak hilang, kembali Tunggal
