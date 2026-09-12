import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
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
import PageHeader from '@/components/page-header';
import { compressImage } from '@/lib/compress-image';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

export default function BookForm({ book }) {
    const isEdit = !!book;
    const [preview, setPreview] = useState(null);
    const [compressing, setCompressing] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        id_buku: book?.id || '',
        judul_buku: book?.title || '',
        pengarang: book?.author || '',
        jumlah: book?.stock ?? 1,
        foto: null,
        hapus_foto: false,
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
                                </div>
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
                                <Save className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
