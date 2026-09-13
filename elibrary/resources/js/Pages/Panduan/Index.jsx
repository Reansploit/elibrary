import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BookMarked, ImagePlus, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/page-header';

function GuideImage({ src, alt }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/40 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                </span>
                <p className="text-xs text-muted-foreground">
                    Screenshot menyusul — letakkan file di <span className="font-mono">public/images/panduan/{src}</span> lalu
                    refresh halaman ini.
                </p>
            </div>
        );
    }

    return (
        <img
            src={`/images/panduan/${src}`}
            alt={alt}
            onError={() => setFailed(true)}
            className="w-full rounded-lg border object-cover"
        />
    );
}

const guides = [
    {
        id: 'mulai',
        title: 'Mulai cepat',
        desc: 'Alur kerja harian operator dalam 3 langkah.',
        image: 'dashboard.png',
        steps: [
            'Buka Dashboard untuk melihat buku terlambat dan yang akan jatuh tempo.',
            'Untuk transaksi baru, pakai menu Sirkulasi → Pinjam buku.',
            'Butuh data? Ketik di pencarian dashboard (buku, anggota, pengguna).',
        ],
    },
    {
        id: 'buku',
        title: 'Kelola buku',
        desc: 'Menu Buku: tambah, ubah, stok, foto, dan lokasi rak.',
        image: 'buku.png',
        steps: [
            'Tambah buku hanya butuh ID dan judul (harus unik); pengarang, jumlah, foto, dan lokasi opsional.',
            'ID buku bisa diubah di form Edit — data peminjaman ikut menyesuaikan otomatis.',
            'Stok menentukan berapa eksemplar yang bisa dipinjam bersamaan.',
            'Isi lokasi/rak agar santri mudah menemukan buku via katalog.',
        ],
    },
    {
        id: 'anggota',
        title: 'Kelola anggota',
        desc: 'Menu Anggota: data santri + kartu RFID.',
        image: 'anggota.png',
        steps: [
            'ID RFID diisi sekali saat tambah anggota dan tidak bisa diubah.',
            'Tempel kartu ke scanner di kolom anggota form pinjam, tekan Enter — anggota langsung terpilih.',
            'Kalau scanner tidak ada, ketik nama/RFID lalu Enter atau klik hasil.',
            'Nomor RFID disembunyikan di tampilan demi keamanan kartu.',
        ],
    },
    {
        id: 'pinjam',
        title: 'Pinjam buku',
        desc: 'Menu Sirkulasi → Pinjam buku.',
        image: 'pinjam.png',
        steps: [
            'Cari buku (judul/ID) dan anggota (nama/RFID), atau scan kartu lalu Enter untuk simpan otomatis.',
            'Tanggal kembali terisi otomatis dari pengaturan lama pinjam, tapi bisa diubah manual.',
            'Pinjaman ditolak bila: stok habis, anggota dibatasi, melewati batas pinjaman, atau buku direservasi pihak lain — baca pesan errornya.',
        ],
    },
    {
        id: 'kembali',
        title: 'Kembali & perpanjang',
        desc: 'Tombol di tabel Sirkulasi dan Keterlambatan.',
        image: 'kembali.png',
        steps: [
            'Kembalikan: ubah status pinjaman menjadi selesai dan catat tanggal kembali.',
            'Perpanjang: tambah masa pinjam sekian hari (default ikut pengaturan).',
        ],
    },
    {
        id: 'terlambat',
        title: 'Keterlambatan',
        desc: 'Menu Sirkulasi → Cek terlambat.',
        image: 'terlambat.png',
        steps: [
            'Terlambat: melewati tanggal kembali. Jatuh tempo: sisa ≤ 3 hari.',
            'Selesaikan dari sini juga (kembalikan/perpanjang) tanpa pindah halaman.',
        ],
    },
    {
        id: 'sanksi',
        title: 'Sanksi (pembatasan)',
        desc: 'Menu Sanksi: batasi hak pinjam anggota untuk sementara.',
        image: 'sanksi.png',
        steps: [
            'Kelola → centang "Batasi peminjaman" + isi lama hari → Simpan.',
            'Anggota yang dibatasi tidak bisa meminjam sampai masanya habis.',
            'Untuk mencabut lebih awal, buka lagi dan hilangkan centang.',
        ],
    },
    {
        id: 'reservasi',
        title: 'Reservasi',
        desc: 'Menu Reservasi: antrean buku yang sedang habis.',
        image: 'reservasi.png',
        steps: [
            'Tambah reservasi untuk anggota yang menunggu buku tertentu.',
            'Saat buku kembali, antrean tertua otomatis jadi "Siap diambil".',
            'Saat pemegang antrean meminjam, reservasi otomatis selesai. Pihak lain yang menyerobot akan ditolak.',
            'Batalkan antrean yang tidak jadi dari tombol Batal.',
        ],
    },
    {
        id: 'lokasi',
        title: 'Lokasi / rak',
        desc: 'Menu Lokasi: master data rak penyimpanan.',
        image: 'lokasi.png',
        steps: [
            'Buat dulu lokasinya (kode + nama, mis. A1 — Rak Fiksi).',
            'Pilih lokasi di form tambah/edit buku — hanya bisa pilih yang sudah ada.',
            'Lokasi yang masih dipakai buku tidak bisa dihapus.',
        ],
    },
    {
        id: 'katalog',
        title: 'Katalog publik',
        desc: 'Halaman /katalog — bisa dibuka santri tanpa login.',
        image: 'katalog.png',
        steps: [
            'Bagikan alamat katalog ke santri untuk cek stok mandiri.',
            'Menampilkan foto, stok, lokasi rak, dan status tersedia/habis — tanpa data peminjam.',
        ],
    },
    {
        id: 'pengaturan',
        title: 'Pengaturan (admin)',
        desc: 'Menu Pengaturan — hanya untuk yang berizin.',
        image: 'pengaturan.png',
        steps: [
            'Umum: ganti nama aplikasi yang tampil di sidebar dan judul.',
            'Peminjaman: lama pinjam default dan batas pinjaman per anggota.',
            'Pengguna: tambah/edit akun + tentukan role-nya (tanpa email pun bisa).',
            'Role: atur izin per role — menu yang tak berizin otomatis abu dan URL-nya ditolak.',
        ],
    },
];

const faqs = [
    {
        q: 'Kartu RFID tidak terbaca scanner?',
        a: 'Pastikan kursor di kolom anggota, lalu ketik manual nomor RFID-nya dan tekan Enter. Scanner pada dasarnya hanya mengetik + Enter otomatis.',
    },
    {
        q: 'Kenapa simpan pinjaman gagal?',
        a: 'Baca pesan merahnya: stok habis, anggota sedang dibatasi, sudah mencapai batas pinjaman, atau buku direservasi pihak lain. Perbaiki sesuai pesan tersebut.',
    },
    {
        q: 'Upload foto gagal?',
        a: 'Pakai file JPG/PNG. Foto besar dari HP dikompresi otomatis oleh aplikasi; bila tetap gagal, kecilkan dulu di bawah 2MB.',
    },
    {
        q: 'Lupa password akun?',
        a: 'Minta admin meresetkan lewat Pengaturan → Pengguna (edit akun). Jaga akun Administrator jangan sampai terkunci.',
    },
    {
        q: 'Menu abu-abu tidak bisa diklik?',
        a: 'Itu berarti role akunmu tidak punya izin untuk menu tersebut. Minta admin menambah izin di Pengaturan → Role.',
    },
    {
        q: 'Mau mode terang/gelap?',
        a: 'Saklarnya ada di bawah sidebar. Pilihanmu diingat per perangkat.',
    },
    {
        q: 'Apakah update menghilangkan data?',
        a: 'Tidak. Update (git pull + migrate) tidak menghapus data buku, anggota, maupun transaksi.',
    },
];

export default function PanduanIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Panduan" />

            <div className="space-y-6">
                <PageHeader
                    title="Panduan"
                    description="Cara memakai setiap fitur, langkah per langkah"
                    icon={BookMarked}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar isi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {guides.map((g) => (
                                <a
                                    key={g.id}
                                    href={`#panduan-${g.id}`}
                                    className="rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                                >
                                    {g.title}
                                </a>
                            ))}
                            <a
                                href="#panduan-faq"
                                className="rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                            >
                                FAQ
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {guides.map((guide, i) => (
                    <Card key={guide.id} id={`panduan-${guide.id}`} className="scroll-mt-20">
                        <CardHeader>
                            <CardTitle>
                                <span className="mr-2 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                                {guide.title}
                            </CardTitle>
                            <CardDescription>{guide.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ol className="space-y-2">
                                {guide.steps.map((step, j) => (
                                    <li key={j} className="flex gap-3 text-sm">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                            {j + 1}
                                        </span>
                                        <span className="text-muted-foreground">
                                            <span className="text-foreground">{step}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <GuideImage src={guide.image} alt={`Panduan ${guide.title}`} />
                        </CardContent>
                    </Card>
                ))}

                <Card id="panduan-faq" className="scroll-mt-20">
                    <CardHeader>
                        <CardTitle>Pertanyaan umum (FAQ)</CardTitle>
                        <CardDescription>Klik pertanyaan untuk melihat jawaban</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-lg border">
                            {faqs.map((faq, i) => (
                                <details key={i} className="group px-4 py-3">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                                        {faq.q}
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                                    </summary>
                                    <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
