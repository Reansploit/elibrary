import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
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

export default function LokasiForm({ location }) {
    const isEdit = !!location;

    const { data, setData, post, errors, processing } = useForm({
        id_lokasi: location?.id || '',
        nama: location?.name || '',
        keterangan: location?.description || '',
        ...(isEdit ? { _method: 'PUT' } : {}),
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('lokasi.update', location.id));
        } else {
            post(route('lokasi.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Lokasi' : 'Tambah Lokasi'} />

            <div className="mx-auto w-full max-w-2xl space-y-6">
                <PageHeader
                    title={isEdit ? 'Edit lokasi' : 'Tambah lokasi'}
                    description={isEdit ? 'Ubah data lokasi yang sudah ada' : 'Masukkan rak/lokasi baru'}
                    icon={MapPin}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('lokasi.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data lokasi</CardTitle>
                            <CardDescription>Isi semua field yang diperlukan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 sm:max-w-48">
                                <Label htmlFor="id_lokasi">
                                    Kode <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="id_lokasi"
                                    placeholder="Contoh: A1"
                                    value={data.id_lokasi}
                                    onChange={(e) => setData('id_lokasi', e.target.value)}
                                    aria-invalid={!!errors.id_lokasi || undefined}
                                />
                                <FieldError message={errors.id_lokasi} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nama">
                                    Nama <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: Rak Fiksi"
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
                                    placeholder="Opsional, misal: lantai 2 sisi barat"
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
                                <Link href={route('lokasi.index')}>Batal</Link>
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
