import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, BookOpen, FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import PageHeader from '@/components/page-header';
import { Swirling } from '@/components/ui/loading';
import { compressImage } from '@/lib/compress-image';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

export default function BookForm({ book, locations = [], categories = [] }) {
    const isEdit = !!book;
    const [preview, setPreview] = useState(null);
    const [compressing, setCompressing] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        id_buku: book?.id || '',
        judul_buku: book?.title || '',
        pengarang: book?.author || '',
        jumlah: book?.stock ?? 1,
        lokasi: book?.location || '',
        kategori: book?.category || '',
        jenis: book?.jenis || 'buku',
        foto: null,
        ebook: null,
        hapus_foto: false,
        hapus_ebook: false,
        ...(isEdit ? { _method: 'PUT' } : {}),
    });

    const existingPhoto = !isEdit ? null : !data.hapus_foto && !preview ? book?.photo : null;

    const handleFile = async (e) => {
        const file = e.target.files?.[0] || null;
        if (preview) URL.revokeObjectURL(preview);
        if (!file) {
            setPreview(null);
            setData({ ...data, foto: null, hapus_foto: false });
            return;
        }
        setCompressing(true);
        try {
            const processed = await compressImage(file);
            setPreview(URL.createObjectURL(processed));
            setData({ ...data, foto: processed, hapus_foto: false });
        } finally {
            setCompressing(false);
        }
    };

    const clearPhoto = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setData({ ...data, foto: null, hapus_foto: true });
        const el = document.getElementById('foto');
        if (el) el.value = '';
    };

    const handleEbook = (e) => {
        const file = e.target.files?.[0] || null;
        setData({ ...data, ebook: file, hapus_ebook: false });
    };

    const clearEbook = () => {
        setData({ ...data, ebook: null, hapus_ebook: true });
        const el = document.getElementById('ebook');
        if (el) el.value = '';
    };

    const changeJenis = (value) => {
        setData({
            ...data,
            jenis: value,
            ...(value === 'ebook'
                ? { lokasi: '', jumlah: 0, hapus_ebook: false }
                : { ebook: null, hapus_ebook: true, jumlah: data.jumlah || 1 }),
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('books.update', book.id));
        } else {
            post(route('books.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Buku' : 'Tambah Buku'} />

            <div className="mx-auto w-full max-w-2xl space-y-6">
                <PageHeader
                    title={isEdit ? 'Edit buku' : 'Tambah buku'}
                    description={isEdit ? 'Ubah data buku yang sudah ada' : 'Masukkan data buku baru'}
                    icon={BookOpen}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('books.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data buku</CardTitle>
                            <CardDescription>Isi semua field yang diperlukan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="id_buku">
                                        ID buku <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="id_buku"
                                        placeholder="Contoh: BK-001"
                                        value={data.id_buku}
                                        onChange={(e) => setData('id_buku', e.target.value)}
                                        aria-invalid={!!errors.id_buku || undefined}
                                    />
                                    <FieldError message={errors.id_buku} />
                                </div>

                                {data.jenis === 'buku' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah">
                                            Jumlah <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="jumlah"
                                            type="number"
                                            min={0}
                                            max={9999}
                                            value={data.jumlah}
                                            onChange={(e) => setData('jumlah', e.target.value)}
                                            aria-invalid={!!errors.jumlah || undefined}
                                        />
                                        <FieldError message={errors.jumlah} />
                                        <p className="text-xs text-muted-foreground">
                                            Mengubah jumlah otomatis menambah/mengurangi kartu eksemplar.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="judul_buku">
                                    Judul buku <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="judul_buku"
                                    placeholder="Masukkan judul buku"
                                    value={data.judul_buku}
                                    onChange={(e) => setData('judul_buku', e.target.value)}
                                    aria-invalid={!!errors.judul_buku || undefined}
                                />
                                <FieldError message={errors.judul_buku} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pengarang">Pengarang</Label>
                                <Input
                                    id="pengarang"
                                    placeholder="Nama pengarang (opsional)"
                                    value={data.pengarang}
                                    onChange={(e) => setData('pengarang', e.target.value)}
                                    aria-invalid={!!errors.pengarang || undefined}
                                />
                                <FieldError message={errors.pengarang} />
                            </div>

                            {data.jenis === 'buku' && (
                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Lokasi / rak (opsional)</Label>
                                    <Select
                                        value={data.lokasi || '__none__'}
                                        onValueChange={(val) => setData('lokasi', val === '__none__' ? '' : val)}
                                    >
                                        <SelectTrigger
                                            id="lokasi"
                                            className="w-full"
                                            aria-invalid={!!errors.lokasi || undefined}
                                        >
                                            <SelectValue placeholder="Pilih lokasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">Tanpa lokasi</SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.lokasi} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="kategori">Kategori (opsional)</Label>
                                <Select
                                    value={data.kategori || '__none__'}
                                    onValueChange={(val) => setData('kategori', val === '__none__' ? '' : val)}
                                >
                                    <SelectTrigger
                                        id="kategori"
                                        className="w-full"
                                        aria-invalid={!!errors.kategori || undefined}
                                    >
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">Tanpa kategori</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError message={errors.kategori} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis">Jenis koleksi <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.jenis || 'buku'}
                                    onValueChange={changeJenis}
                                >
                                    <SelectTrigger
                                        id="jenis"
                                        className="w-full"
                                        aria-invalid={!!errors.jenis || undefined}
                                    >
                                        <SelectValue placeholder="Pilih jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="buku">Buku</SelectItem>
                                        <SelectItem value="ebook">Ebook</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Ebook dapat dibaca lewat viewer digital tanpa eksemplar fisik.
                                </p>
                                <FieldError message={errors.jenis} />
                            </div>

                            {data.jenis === 'ebook' && (
                                <div className="space-y-2">
                                    <Label htmlFor="ebook">
                                        File PDF {!isEdit && <span className="text-destructive">*</span>}
                                    </Label>
                                    {book?.ebook && !data.hapus_ebook && !data.ebook && (
                                        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{book.ebook.original_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {Math.ceil(book.ebook.size_bytes / 1024)} KB
                                                </p>
                                            </div>
                                            <Button type="button" variant="ghost" size="sm" onClick={clearEbook}>
                                                <X className="h-4 w-4" />
                                                Hapus
                                            </Button>
                                        </div>
                                    )}
                                    {data.ebook && (
                                        <p className="text-xs text-muted-foreground">
                                            File baru: {data.ebook.name}
                                        </p>
                                    )}
                                    <Input
                                        id="ebook"
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={handleEbook}
                                        required={!isEdit}
                                        aria-invalid={!!errors.ebook || undefined}
                                    />
                                    <p className="text-xs text-muted-foreground">PDF maksimal 50 MB.</p>
                                    <FieldError message={errors.ebook} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="foto">Foto sampul (opsional)</Label>
                                {(preview || existingPhoto) && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={preview || existingPhoto}
                                            alt="Pratinjau sampul"
                                            className="h-16 w-16 rounded-lg border object-cover"
                                        />
                                        <Button type="button" variant="ghost" size="sm" onClick={clearPhoto}>
                                            Hapus foto
                                        </Button>
                                    </div>
                                )}
                                <Input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    aria-invalid={!!errors.foto || undefined}
                                />
                                <p className="text-xs text-muted-foreground">
                                    
                                    {compressing && ' Memproses foto…'}
                                </p>
                                <FieldError message={errors.foto} />
                            </div>

                            {isEdit && (
                                <p className="text-xs text-muted-foreground">
                                    ID buku boleh diubah dan harus unik. Perubahan ID otomatis mengikuti
                                    ke data sirkulasi terkait.
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route('books.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing || compressing}>
                                {processing ? (
                                    <Swirling className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {processing ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
