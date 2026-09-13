import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { GraduationCap, ArrowUpFromLine, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';

export default function Promote({ classes, members }) {
    const active = useMemo(() => (members || []).filter((m) => m.active), [members]);
    const alumni = useMemo(() => (members || []).filter((m) => !m.active), [members]);

    const [kelasAsal, setKelasAsal] = useState('');
    const [checked, setChecked] = useState([]);
    const [kelasTujuan, setKelasTujuan] = useState('');
    const [saving, setSaving] = useState(false);
    const [graduateOpen, setGraduateOpen] = useState(false);
    const [search, setSearch] = useState('');

    const listed = useMemo(() => {
        if (!kelasAsal) return [];
        return active.filter((m) => m.class === kelasAsal);
    }, [active, kelasAsal]);

    const toggle = (id) => {
        setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        setChecked((prev) =>
            prev.length === listed.length ? [] : listed.map((m) => m.id)
        );
    };

    const pickClass = (kelas) => {
        setKelasAsal(kelas);
        setChecked([]);
    };

    const promote = () => {
        if (!checked.length || !kelasTujuan.trim()) return;
        setSaving(true);
        router.post(route('members.promoteBatch'), { ids: checked, kelas: kelasTujuan.trim() }, {
            onFinish: () => {
                setSaving(false);
                setChecked([]);
            },
        });
    };

    const graduate = () => {
        if (!checked.length) return;
        setSaving(true);
        router.post(route('members.graduateBatch'), { ids: checked }, {
            onFinish: () => {
                setSaving(false);
                setChecked([]);
                setGraduateOpen(false);
            },
        });
    };

    const reactivate = (id) => {
        router.post(route('members.reactivate', id));
    };

    const alumniFiltered = useMemo(() => {
        if (!search.trim()) return alumni;
        const q = search.toLowerCase();
        return alumni.filter(
            (m) => m.name?.toLowerCase().includes(q) || m.id?.toLowerCase().includes(q)
        );
    }, [alumni, search]);

    return (
        <AuthenticatedLayout>
            <Head title="Kenaikan Kelas" />

            <div className="space-y-6">
                <PageHeader
                    title="Kenaikan kelas"
                    description="Naikkan kelas santri per rombel atau luluskan alumni sekaligus"
                    icon={GraduationCap}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>1. Pilih kelas</CardTitle>
                        <CardDescription>
                            {(classes || []).length} rombel aktif • {active.length} santri aktif
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {(classes || []).map((kelas) => (
                                <button
                                    key={kelas}
                                    type="button"
                                    onClick={() => pickClass(kelas)}
                                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                        kelasAsal === kelas
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'bg-card hover:bg-muted'
                                    }`}
                                >
                                    {kelas}
                                </button>
                            ))}
                        </div>
                        {(classes || []).length === 0 && (
                            <p className="text-sm text-muted-foreground">Belum ada data kelas.</p>
                        )}
                    </CardContent>
                </Card>

                {kelasAsal && (
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>2. Pilih santri — {kelasAsal}</CardTitle>
                                <CardDescription>
                                    {checked.length} dari {listed.length} dipilih
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <div className="space-y-1">
                                    <Label htmlFor="kelas_tujuan">Naik ke kelas</Label>
                                    <Input
                                        id="kelas_tujuan"
                                        placeholder="mis. XI IPA 1"
                                        value={kelasTujuan}
                                        onChange={(e) => setKelasTujuan(e.target.value)}
                                        className="sm:w-44"
                                    />
                                </div>
                                <Button
                                    disabled={!checked.length || !kelasTujuan.trim() || saving}
                                    onClick={promote}
                                >
                                    <ArrowUpFromLine className="h-4 w-4" />
                                    {saving ? 'Menyimpan...' : 'Naikkan'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={!checked.length || saving}
                                    onClick={() => setGraduateOpen(true)}
                                >
                                    <GraduationCap className="h-4 w-4" />
                                    Luluskan
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {listed.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-primary"
                                                    checked={checked.length === listed.length && listed.length > 0}
                                                    onChange={toggleAll}
                                                    aria-label="Pilih semua"
                                                />
                                            </TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Pinjaman aktif</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {listed.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 accent-primary"
                                                        checked={checked.includes(m.id)}
                                                        onChange={() => toggle(m.id)}
                                                        aria-label={m.name}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{m.name}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {m.active_loans > 0 ? (
                                                        <Badge variant="secondary">{m.active_loans} buku</Badge>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={GraduationCap}
                                    title="Kelas kosong"
                                    description={`Tidak ada santri aktif di ${kelasAsal}.`}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Alumni (nonaktif)</CardTitle>
                            <CardDescription>
                                {alumni.length} santri • tidak bisa meminjam
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari alumni..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {alumniFiltered.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kelas terakhir</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alumniFiltered.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell className="font-medium">{m.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {m.class || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => reactivate(m.id)}
                                                    >
                                                        Aktifkan lagi
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState
                                icon={GraduationCap}
                                title="Belum ada alumni"
                                description="Santri yang diluluskan tampil di sini."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={graduateOpen}
                onOpenChange={setGraduateOpen}
                title="Luluskan santri"
                description={
                    <>
                        Luluskan {checked.length} santri? Mereka langsung nonaktif dan tidak bisa
                        meminjam lagi.
                    </>
                }
                confirmLabel="Luluskan"
                processing={saving}
                onConfirm={graduate}
            />
        </AuthenticatedLayout>
    );
}
