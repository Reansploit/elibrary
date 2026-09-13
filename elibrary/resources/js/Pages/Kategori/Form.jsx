import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Tags } from 'lucide-react';
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

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

export default function KategoriForm({ category }) {
    const isEdit = !!category;

    const { data, setData, post, errors, processing } = useForm({
        id_kategori: category?.id || '',
        nama: category?.name || '',
        keterangan: category?.description || '',
        ...(isEdit ? { _method: 'PUT' } : {}),
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('kategori.update', category.id));
        } else {
            post(route('kategori.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'} />

            <div className="mx-auto w-full max-w-2xl space-y-6">
                <PageHeader
                    title={isEdit ? 'Edit kategori' : 'Tambah kategori'}
                    description={isEdit ? 'Ubah data kategori yang sudah ada' : 'Masukkan kelompok buku baru'}
                    icon={Tags}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('kategori.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data kategori</CardTitle>
                            <CardDescription>Isi semua field yang diperlukan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 sm:max-w-48">
                                <Label htmlFor="id_kategori">
                                    Kode <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="id_kategori"
                                    placeholder="Contoh: FIQ"
                                    value={data.id_kategori}
                                    onChange={(e) => setData('id_kategori', e.target.value)}
                                    aria-invalid={!!errors.id_kategori || undefined}
                                />
                                <FieldError message={errors.id_kategori} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nama">
                                    Nama <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: Fikih"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    aria-invalid={!!errors.nama || undefined}
                                />
                                <FieldError message={errors.nama} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Input
                                    id="keterangan"
                                    placeholder="Opsional"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    aria-invalid={!!errors.keterangan || undefined}
                                />
                                <FieldError message={errors.keterangan} />
                            </div>

                            {isEdit && (
                                <p className="text-xs text-muted-foreground">
                                    Kode boleh diubah dan harus unik. Perubahan kode otomatis mengikuti
                                    ke data buku.
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route('kategori.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
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
