import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, Download, FileCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';

const TITLES = { buku: 'Buku', anggota: 'Anggota' };
const HINTS = {
    buku: 'Kolom: id_buku, judul_buku, pengarang, jumlah, lokasi (kode rak, boleh kosong). Foto diisi belakangan via Edit.',
    anggota: 'Kolom: id_anggota (RFID), nama, jekel (Laki-laki/Perempuan), kelas. Foto diisi belakangan via Edit.',
};

export default function ImportIndex({ type, preview }) {
    const title = TITLES[type] || 'Buku';
    const { data, setData, post, processing, errors, reset } = useForm({ file: null });

    const submitFile = (e) => {
        e.preventDefault();
        if (!data.file) return;
        post(route('import.preview', type), {
            onSuccess: () => reset('file'),
        });
    };

    const [saving, setSaving] = useState(false);
    const { post: confirm } = useForm();
    const saveAll = () => {
        setSaving(true);
        confirm(route('import.store', type), {
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Impor ${title}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Impor ${title}`}
                    description="Dari Excel: isi template, Save As CSV, unggah di sini"
                    icon={Upload}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={type === 'buku' ? route('books.index') : route('members.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>1. Unduh template</CardTitle>
                        <CardDescription>{HINTS[type]}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <a href={route('import.template', type)}>
                                <Download className="h-4 w-4" />
                                Unduh template CSV
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Unggah CSV</CardTitle>
                        <CardDescription>Maksimal 2000 baris • koma/titik-koma otomatis dikenali</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitFile} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="space-y-1">
                                <Label htmlFor="file">File CSV</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={(e) => setData('file', e.target.files[0] || null)}
                                />
                                {errors.file && (
                                    <p className="text-xs text-destructive">{errors.file}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={!data.file || processing}>
                                <Upload className="h-4 w-4" />
                                {processing ? 'Memeriksa...' : 'Periksa'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {preview && (
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>3. Preview</CardTitle>
                                <CardDescription>
                                    {preview.valid} valid • {preview.invalid} bermasalah — yang bermasalah
                                    dilewati saat simpan
                                </CardDescription>
                            </div>
                            <Button disabled={!preview.valid || saving} onClick={saveAll}>
                                <FileCheck className="h-4 w-4" />
                                {saving ? 'Menyimpan...' : `Simpan ${preview.valid} baris`}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {preview.rows?.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Baris</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead className="text-right">Hasil</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {preview.rows.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-xs">
                                                    {row.line}
                                                </TableCell>
                                                <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                                                    {Object.values(row.data || {}).join(' • ')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        {row.valid ? (
                                                            <Badge variant="outline">Valid</Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="destructive"
                                                                title={(row.errors || []).join(' ')}
                                                            >
                                                                {(row.errors || []).join(' ') || 'Gagal'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={Upload}
                                    title="File kosong"
                                    description="Tidak ada baris data di file tersebut."
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
