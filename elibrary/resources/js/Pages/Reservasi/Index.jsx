import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Ticket, Plus, Search, Check, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
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
import ConfirmDialog from '@/components/confirm-dialog';
import SearchSelect from '@/components/search-select';
import Pagination from '@/components/pagination';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

const statusFilters = [
    { value: 'all', label: 'Semua status' },
    { value: 'antre', label: 'Antre' },
    { value: 'siap', label: 'Siap diambil' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'batal', label: 'Dibatalkan' },
];

const statusMeta = {
    antre: { label: 'Antre', variant: 'secondary' },
    siap: { label: 'Siap diambil', variant: 'default' },
    selesai: { label: 'Selesai', variant: 'outline' },
    batal: { label: 'Dibatalkan', variant: 'destructive' },
};

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

export default function ReservasiIndex({ reservations, books, members }) {
    const can = useCan();
    const canManage = can('manage_reservations');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const { data, setData, post, errors, processing, reset } = useForm({
        id_buku: '',
        id_anggota: '',
    });

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (reservations || []).filter((r) => {
            const matchSearch =
                !q ||
                r.book?.toLowerCase().includes(q) ||
                r.member?.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [reservations, search, statusFilter]);

    const paging = usePagination(filtered);
    const openCount = (reservations || []).filter((r) =>
        ['antre', 'siap'].includes(r.status)
    ).length;

    const openAdd = () => {
        reset();
        setAddOpen(true);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('reservasi.store'), {
            onSuccess: () => setAddOpen(false),
        });
    };

    const confirmCancel = () => {
        if (!cancelTarget) return;
        post(route('reservasi.batal', cancelTarget.id), {
            onSuccess: () => setCancelTarget(null),
        });
    };

    const markDone = (id) => {
        post(route('reservasi.selesai', id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reservasi" />

            <div className="space-y-6">
                <PageHeader
                    title="Reservasi"
                    description="Antrean buku yang sedang habis dipinjam"
                    icon={Ticket}
                    actions={
                        canManage && (
                            <Button onClick={openAdd}>
                                <Plus className="h-4 w-4" />
                                Tambah reservasi
                            </Button>
                        )
                    }
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle>Daftar reservasi</CardTitle>
                            <CardDescription>
                                {openCount} antrean aktif dari {reservations?.length || 0} reservasi
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari buku atau anggota…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-44">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusFilters.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>
                                            {f.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filtered.length > 0 ? (
                            <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead>Tgl pesan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((r) => {
                                        const meta = statusMeta[r.status] || statusMeta.antre;
                                        const open = ['antre', 'siap'].includes(r.status);
                                        return (
                                            <TableRow key={r.id}>
                                                <TableCell className="max-w-40 truncate font-medium">
                                                    {r.book}
                                                </TableCell>
                                                <TableCell className="max-w-32 truncate text-muted-foreground">
                                                    {r.member}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {r.date || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={meta.variant}>{meta.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        {canManage && open && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => markDone(r.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    Selesai
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => setCancelTarget(r)}
                                                                >
                                                                    <Ban className="h-3.5 w-3.5" />
                                                                    Batal
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <Pagination pagination={paging} />
                            </>
                        ) : (
                            <EmptyState
                                icon={Ticket}
                                title={search || statusFilter !== 'all' ? 'Tidak ada hasil' : 'Belum ada reservasi'}
                                description={
                                    search || statusFilter !== 'all'
                                        ? 'Ubah kata kunci atau filter status.'
                                        : 'Tambah reservasi untuk buku yang sedang habis.'
                                }
                                action={
                                    !search && statusFilter === 'all' && canManage && (
                                        <Button size="sm" onClick={openAdd}>
                                            <Plus className="h-4 w-4" />
                                            Tambah reservasi
                                        </Button>
                                    )
                                }
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah reservasi</DialogTitle>
                        <DialogDescription>
                            Pesan buku yang sedang habis untuk anggota
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>
                                    Buku <span className="text-destructive">*</span>
                                </Label>
                                <SearchSelect
                                    value={data.id_buku}
                                    onChange={(val) => setData('id_buku', val)}
                                    options={(books || []).map((book) => ({
                                        value: book.id,
                                        label: `${book.id} — ${book.title}`,
                                    }))}
                                    placeholder="Ketik judul atau ID buku…"
                                    emptyText="Buku tidak ditemukan."
                                />
                                <FieldError message={errors.id_buku} />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    Anggota <span className="text-destructive">*</span>
                                </Label>
                                <SearchSelect
                                    value={data.id_anggota}
                                    onChange={(val) => setData('id_anggota', val)}
                                    options={(members || []).map((member) => ({
                                        value: member.id,
                                        label: `${member.id} — ${member.name}`,
                                    }))}
                                    placeholder="Ketik nama atau RFID anggota…"
                                    emptyText="Anggota tidak ditemukan."
                                />
                                <FieldError message={errors.id_anggota} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>
                                Batal
                            </DialogClose>
                            <Button type="submit" disabled={processing}>
                                <Ticket className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!cancelTarget}
                onOpenChange={(open) => {
                    if (!open) setCancelTarget(null);
                }}
                title="Batalkan reservasi"
                description={
                    <>
                        Batalkan reservasi{' '}
                        <span className="font-medium text-foreground">{cancelTarget?.book}</span>{' '}
                        untuk{' '}
                        <span className="font-medium text-foreground">{cancelTarget?.member}</span>?
                    </>
                }
                confirmLabel="Ya, batalkan"
                onConfirm={confirmCancel}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
