import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, Users, Eye, EyeOff } from 'lucide-react';
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

export default function MemberForm({ member }) {
    const isEdit = !!member;
    const [preview, setPreview] = useState(null);
    const [compressing, setCompressing] = useState(false);
    const [showRfid, setShowRfid] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        id_anggota: member?.id || '',
        nama: member?.name || '',
        jekel: member?.gender || '',
        kelas: member?.class || '',
        foto: null,
        hapus_foto: false,
        ...(isEdit ? { _method: 'PUT' } : {}),
    });

    const existingPhoto = !isEdit ? null : !data.hapus_foto && !preview ? member?.photo : null;

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
            post(route('members.update', member.id));
        } else {
            post(route('members.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Anggota' : 'Tambah Anggota'} />

            <div className="mx-auto w-full max-w-2xl space-y-6">
                <PageHeader
                    title={isEdit ? 'Edit anggota' : 'Tambah anggota'}
                    description={isEdit ? 'Ubah data anggota yang sudah ada' : 'Masukkan data anggota baru'}
                    icon={Users}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('members.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data anggota</CardTitle>
                            <CardDescription>Isi semua field yang diperlukan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama</Label>
                                <Input
                                    id="nama"
                                    placeholder="Nama lengkap anggota"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    aria-invalid={!!errors.nama || undefined}
                                />
                                <FieldError message={errors.nama} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="jekel">
                                        Jenis kelamin <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.jekel}
                                        onValueChange={(val) => setData('jekel', val)}
                                    >
                                        <SelectTrigger
                                            id="jekel"
                                            className="w-full"
                                            aria-invalid={!!errors.jekel || undefined}
                                        >
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.jekel} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kelas">Kelas</Label>
                                    <Input
                                        id="kelas"
                                        placeholder="Contoh: X IPA 1"
                                        value={data.kelas}
                                        onChange={(e) => setData('kelas', e.target.value)}
                                        aria-invalid={!!errors.kelas || undefined}
                                    />
                                    <FieldError message={errors.kelas} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foto">Foto (opsional)</Label>
                                {(preview || existingPhoto) && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={preview || existingPhoto}
                                            alt="Pratinjau foto"
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

                            {!isEdit && (
                                <div className="space-y-2">
                                    <Label htmlFor="id_anggota">
                                        ID RFID <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="id_anggota"
                                            type={showRfid ? 'text' : 'password'}
                                            placeholder="Tempel kartu / ketik RFID"
                                            maxLength={50}
                                            value={data.id_anggota}
                                            onChange={(e) => setData('id_anggota', e.target.value)}
                                            aria-invalid={!!errors.id_anggota || undefined}
                                            className="pr-10 font-mono"
                                            autoComplete="off"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRfid((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                            title={showRfid ? 'Sembunyikan' : 'Tampilkan'}
                                            aria-label={showRfid ? 'Sembunyikan RFID' : 'Tampilkan RFID'}
                                        >
                                            {showRfid ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Disensor agar tidak diintip — klik ikon mata untuk memeriksa.
                                    </p>
                                    <FieldError message={errors.id_anggota} />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route('members.index')}>Batal</Link>
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
