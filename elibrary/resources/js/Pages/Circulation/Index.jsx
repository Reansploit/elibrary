import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, RotateCcw, ArrowLeftRight, Search, AlertCircle, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';
import ExtendLoanDialog from '@/components/extend-loan-dialog';
import Pagination from '@/components/pagination';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

export default function CirculationIndex({ circulations, loan_duration = 7 }) {
    const can = useCan();
    const canBorrow = can('borrow_books');
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [circToReturn, setCircToReturn] = useState(null);
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [circToExtend, setCircToExtend] = useState(null);
    const [search, setSearch] = useState('');
    const { post, processing } = useForm();

    const filtered = useMemo(() => {
        if (!search.trim()) return circulations || [];
        const q = search.toLowerCase();
        return (circulations || []).filter(
            (c) => c.book?.toLowerCase().includes(q) || c.member?.toLowerCase().includes(q)
        );
    }, [circulations, search]);

    const paging = usePagination(filtered);

    const confirmReturn = (circ) => {
        setCircToReturn(circ);
        setReturnDialogOpen(true);
    };

    const handleReturn = () => {
        if (!circToReturn) return;
        post(route('circulation.return', circToReturn.id), {
            onSuccess: () => {
                setReturnDialogOpen(false);
                setCircToReturn(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sirkulasi" />

            <div className="space-y-6">
                <PageHeader
                    title="Sirkulasi"
                    description="Data peminjaman dan pengembalian buku"
                    icon={ArrowLeftRight}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={route('circulation.overdue')}>
                                    <AlertCircle className="h-4 w-4" />
                                    Cek terlambat
                                </Link>
                            </Button>
                            {can('borrow_books') && (
                                <Button asChild>
                                    <Link href={route('circulation.create')}>
                                        <Plus className="h-4 w-4" />
                                        Pinjam buku
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar sirkulasi</CardTitle>
                            <CardDescription>
                                {filtered.length} dari {circulations?.length || 0} transaksi
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari buku atau anggota..."
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
                                        <TableHead>ID</TableHead>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead>Tgl pinjam</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((circ) => (
                                        <TableRow key={circ.id}>
                                            <TableCell className="font-mono text-xs">
                                                {circ.id}
                                            </TableCell>
                                            <TableCell className="max-w-40 truncate font-medium">
                                                {circ.book}
                                                {circ.exemplar && (
                                                    <span className="block font-mono text-xs font-normal text-muted-foreground">
                                                        {circ.exemplar}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-32 truncate text-muted-foreground">
                                                {circ.member}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {circ.borrow_date}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {circ.return_date || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        circ.status === 'PIN' ? 'secondary' : 'outline'
                                                    }
                                                >
                                                    {circ.status === 'PIN' ? 'Dipinjam' : 'Kembali'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {circ.status === 'PIN' && canBorrow && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setCircToExtend(circ);
                                                                setExtendDialogOpen(true);
                                                            }}
                                                        >
                                                            <CalendarPlus className="h-3.5 w-3.5" />
                                                            Perpanjang
                                                        </Button>
                                                    )}
                                                    {circ.status === 'PIN' && can('return_books') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => confirmReturn(circ)}
                                                            disabled={processing}
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            Kembali
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
                                icon={ArrowLeftRight}
                                title={search ? 'Tidak ada hasil' : 'Belum ada transaksi'}
                                description={
                                    search
                                        ? `Tidak ditemukan untuk "${search}".`
                                        : 'Lakukan peminjaman buku untuk memulai.'
                                }
                                action={
                                    !search && can('borrow_books') && (
                                        <Button size="sm" asChild>
                                            <Link href={route('circulation.create')}>
                                                <Plus className="h-4 w-4" />
                                                Pinjam buku
                                            </Link>
                                        </Button>
                                    )
                                }
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={returnDialogOpen}
                onOpenChange={setReturnDialogOpen}
                title="Konfirmasi pengembalian"
                description={
                    <>
                        Tandai buku{' '}
                        <span className="font-medium text-foreground">{circToReturn?.book}</span> yang
                        dipinjam oleh{' '}
                        <span className="font-medium text-foreground">{circToReturn?.member}</span>{' '}
                        sebagai kembali?
                    </>
                }
                confirmLabel="Kembalikan"
                onConfirm={handleReturn}
                processing={processing}
                variant="default"
            />

            <ExtendLoanDialog
                loan={circToExtend}
                open={extendDialogOpen}
                onOpenChange={setExtendDialogOpen}
                defaultDays={loan_duration}
            />
        </AuthenticatedLayout>
    );
}
