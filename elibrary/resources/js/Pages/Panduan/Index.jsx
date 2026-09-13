import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BookMarked,
    ImagePlus,
    Search,
    Zap,
    BookOpen,
    Users,
    ArrowLeftRight,
    RotateCcw,
    AlertCircle,
    Gavel,
    Ticket,
    MapPin,
    Tags,
    ClipboardCheck,
    Library,
    ScrollText,
    Settings,
    FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';

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

const GUIDE_ICON = {
    mulai: Zap,
    buku: BookOpen,
    anggota: Users,
    pinjam: ArrowLeftRight,
    kembali: RotateCcw,
    terlambat: AlertCircle,
    sanksi: Gavel,
    reservasi: Ticket,
    lokasi: MapPin,
    kategori: Tags,
    opname: ClipboardCheck,
    katalog: Library,
    log: ScrollText,
    pengaturan: Settings,
    laporan: FileText,
};

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
            'Buka halaman detail buku untuk melihat tiap eksemplar (BK-001-01, BK-001-02, ...) dan menandai yang hilang atau rusak.',
            'Buku banyak? Pakai tombol Impor di halaman Buku: unduh template, isi di Excel, Save As CSV, unggah.',
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
            'Santri baru banyak? Pakai tombol Impor di halaman Anggota seperti impor buku.',
            'Awal tahun ajaran: buka tombol Kenaikan kelas di halaman Anggota untuk menaikkan rombel sekaligus atau meluluskan alumni.',
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
            'Yang siap diambil tapi lewat batas hari (atur di Pengaturan → Peminjaman) otomatis batal.',
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
        id: 'kategori',
        title: 'Kategori',
        desc: 'Menu Kategori: kelompok kitab/buku.',
        image: 'kategori.png',
        steps: [
            'Buat dulu kategorinya (kode + nama, mis. FIQ — Fikih).',
            'Pilih kategori di form tambah/edit buku — opsional, boleh kosong.',
            'Kategori yang masih dipakai buku tidak bisa dihapus.',
        ],
    },
    {
        id: 'opname',
        title: 'Opname',
        desc: 'Menu Opname: cek fisik buku di rak.',
        image: 'opname.png',
        steps: [
            'Pilih rak (atau cari judul) untuk menentukan lingkup opname.',
            'Keliling rak sambil scan/ketik kode eksemplar lalu Enter, atau centang manual.',
            'Klik Selesaikan opname: yang tidak dicentang dan tadinya tersedia jadi hilang, yang hilang tapi ketemu jadi tersedia lagi.',
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
        id: 'log',
        title: 'Riwayat',
        desc: 'Menu Riwayat: jejak peminjaman dan pengembalian.',
        image: 'log.png',
        steps: [
            'Catatan terisi otomatis setiap ada peminjaman dan pengembalian.',
            'Pakai filter Semua / Dipinjam / Kembali dan kolom cari untuk menelusuri.',
            'Halaman ini hanya baca — tidak bisa diubah atau dihapus.',
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
    {
        id: 'laporan',
        title: 'Laporan',
        desc: 'Menu Laporan: rekap sirkulasi, koleksi, dan anggota.',
        image: 'laporan.png',
        steps: [
            'Pilih jenis laporan Sirkulasi, Koleksi, atau Anggota.',
            'Untuk sirkulasi, atur rentang tanggal lalu klik Tampilkan.',
            'Klik Cetak untuk arsip kertas, atau Unduh CSV untuk dibuka di Excel.',
        ],
    },
];

const GROUPS = ['Dashboard', 'Data', 'Transaksi', 'Arsip', 'Publik & Admin'];

const GROUP_OF = {
    mulai: 'Dashboard',
    buku: 'Data',
    anggota: 'Data',
    lokasi: 'Data',
    kategori: 'Data',
    opname: 'Data',
    pinjam: 'Transaksi',
    kembali: 'Transaksi',
    terlambat: 'Transaksi',
    reservasi: 'Transaksi',
    sanksi: 'Transaksi',
    log: 'Arsip',
    laporan: 'Arsip',
    katalog: 'Publik & Admin',
    pengaturan: 'Publik & Admin',
};

function GuideCard({ guide, onOpen }) {
    const Icon = GUIDE_ICON[guide.id] || BookMarked;
    return (
        <button
            type="button"
            onClick={() => onOpen(guide)}
            className="flex flex-col rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </span>
            <span className="text-sm font-semibold">{guide.title}</span>
            <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{guide.desc}</span>
            <span className="mt-3 text-xs font-medium text-primary">
                {guide.steps.length} langkah →
            </span>
        </button>
    );
}

export default function PanduanIndex() {
    const [query, setQuery] = useState('');
    const [activeGroup, setActiveGroup] = useState('Semua');
    const [openGuide, setOpenGuide] = useState(null);

    const filtered = useMemo(() => {
        let rows = guides;
        if (activeGroup !== 'Semua') {
            rows = rows.filter((g) => (GROUP_OF[g.id] || 'Lainnya') === activeGroup);
        }
        if (query.trim()) {
            const q = query.toLowerCase();
            rows = rows.filter(
                (g) =>
                    g.title.toLowerCase().includes(q) ||
                    g.desc.toLowerCase().includes(q) ||
                    g.steps.some((s) => s.toLowerCase().includes(q))
            );
        }
        return rows;
    }, [query, activeGroup]);

    const visibleGroups =
        activeGroup === 'Semua'
            ? GROUPS.map((name) => ({
                  name,
                  items: filtered.filter((g) => (GROUP_OF[g.id] || 'Lainnya') === name),
              })).filter((g) => g.items.length > 0)
            : [{ name: activeGroup, items: filtered }];

    return (
        <AuthenticatedLayout>
            <Head title="Panduan" />

            <div className="space-y-6">
                <PageHeader
                    title="Panduan"
                    description="Pilih kartu untuk melihat langkah-langkahnya"
                    icon={BookMarked}
                />

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari panduan… mis. RFID, terlambat, rak"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-11 bg-card pl-10"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {['Semua', ...GROUPS].map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setActiveGroup(name)}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                activeGroup === name
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'bg-card hover:bg-muted'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={BookMarked}
                        title="Tidak ketemu"
                        description={`Tidak ada panduan untuk "${query}".`}
                    />
                ) : (
                    visibleGroups.map((group) => (
                        <section key={group.name} className="space-y-3">
                            {activeGroup === 'Semua' && (
                                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.name}
                                </h2>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((guide) => (
                                    <GuideCard key={guide.id} guide={guide} onOpen={setOpenGuide} />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>

            <Dialog open={!!openGuide} onOpenChange={(open) => !open && setOpenGuide(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    {openGuide && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{openGuide.title}</DialogTitle>
                                <DialogDescription>{openGuide.desc}</DialogDescription>
                            </DialogHeader>
                            <ol className="space-y-2 py-2">
                                {openGuide.steps.map((step, j) => (
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
                            <GuideImage src={openGuide.image} alt={`Panduan ${openGuide.title}`} />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
