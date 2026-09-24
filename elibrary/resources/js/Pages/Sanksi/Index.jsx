import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Gavel, Search, Pencil, Ban, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import Pagination from '@/components/pagination';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

export default function SanksiIndex({ members }) {
    const can = useCan();
    const canManage = can('manage_members');
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [target, setTarget] = useState(null);
    const { data, setData, put, processing, errors } = useForm({
        sanksi: false,
        lama_sanksi: 7,
    });

    const filtered = useMemo(() => {
        if (!search.trim()) return members || [];
        const q = search.toLowerCase();
        return (members || []).filter(
            (m) => m.name?.toLowerCase().includes(q) || m.id?.toLowerCase().includes(q)
        );
    }, [members, search]);

    const paging = usePagination(filtered);

    const sanctionedCount = (members || []).filter((m) => m.sanctioned).length;

    const openDialog = (member) => {
        setTarget(member);
        setData({
            sanksi: member.sanctioned,
            lama_sanksi: member.remaining ?? 7,
        });
        setDialogOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!target) return;
        put(route('sanksi.update', target.id), {
            onSuccess: () => {
                setDialogOpen(false);
                setTarget(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pembatasan" />

            <div className="space-y-6">
                <PageHeader
                    title="Pembatasan"
                    description="Kelola pembatasan anggota. Yang dibatasi tidak bisa meminjam"
                    icon={Gavel}
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar anggota</CardTitle>
                            <CardDescription>
                                {sanctionedCount} dari {members?.length || 0} anggota sedang dibatasi
                                {search ? ` • hasil untuk "${search}"` : ''}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau RFID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filtered.length > 0 ? (
                            <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.class || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {member.sanctioned ? (
                                                    <Badge variant="destructive">
                                                        Dibatasi
                                                        {member.until ? ` s/d ${member.until}` : ''}
                                                        {member.remaining !== null
                                                            ? ` • ${member.remaining} hari`
                                                            : ''}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Bebas</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    {canManage && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openDialog(member)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Kelola
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination pagination={paging} />
                            </>
                        ) : (
                            <EmptyState
                                icon={Gavel}
                                title={search ? 'Tidak ada hasil' : 'Belum ada anggota'}
                                description={
                                    search
                                        ? `Tidak ditemukan anggota untuk "${search}".`
                                        : 'Tambah anggota terlebih dahulu.'
                                }
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Kelola pembatasan</DialogTitle>
                        <DialogDescription>
                            Atur pembatasan untuk{' '}
                            <span className="font-medium text-foreground">{target?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit}>
                        <div className="space-y-4 py-4">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    checked={Boolean(data.sanksi)}
                                    onChange={(e) => setData('sanksi', e.target.checked)}
                                />
                                <span className="text-sm font-medium">Batasi peminjaman</span>
                            </label>
                            {data.sanksi && (
                                <div className="space-y-2">
                                    <Label htmlFor="lama_sanksi">
                                        Lama pembatasan (hari) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="lama_sanksi"
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={data.lama_sanksi}
                                        onChange={(e) =>
                                            setData(
                                                'lama_sanksi',
                                                e.target.value === ''
                                                    ? ''
                                                    : parseInt(e.target.value, 10)
                                            )
                                        }
                                        aria-invalid={!!errors.lama_sanksi || undefined}
                                    />
                                    {errors.lama_sanksi && (
                                        <p className="text-xs text-destructive">{errors.lama_sanksi}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Anggota tidak bisa meminjam sampai masa pembatasan berakhir.
                                    </p>
                                </div>
                            )}
                            {!data.sanksi && target?.sanctioned && (
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CircleCheck className="h-4 w-4" />
                                    Pembatasan akan dicabut dan anggota bisa meminjam lagi.
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>
                                Batal
                            </DialogClose>
                            <Button type="submit" disabled={processing}>
                                <Ban className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
