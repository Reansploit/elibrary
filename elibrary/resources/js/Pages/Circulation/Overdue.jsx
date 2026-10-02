import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AlertCircle, ArrowLeft, RotateCcw, Clock, BookCheck, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';
import ExtendLoanDialog from '@/components/extend-loan-dialog';
import StatCard from '@/components/stat-card';
import Pagination from '@/components/pagination';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

export default function Overdue({ overdueLoans, dueSoonLoans, loan_duration = 7 }) {
    const can = useCan();
    const canReturn = can('return_books');
    const canBorrow = can('borrow_books');
    const overduePaging = usePagination(overdueLoans);
    const dueSoonPaging = usePagination(dueSoonLoans);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [circToReturn, setCircToReturn] = useState(null);
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [circToExtend, setCircToExtend] = useState(null);
    const { post, processing } = useForm();

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
            <Head title="Keterlambatan" />

            <div className="space-y-6">
                <PageHeader
                    title="Keterlambatan"
                    description="Buku yang melewati tanggal pengembalian"
                    icon={AlertCircle}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('dashboard')}>
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                        label="Terlambat"
                        value={overdueLoans?.length || 0}
                        icon={AlertCircle}
                        hint="Perlu ditindaklanjuti"
                    />
                    <StatCard
                        label="Jatuh tempo ≤ 3 hari"
                        value={dueSoonLoans?.length || 0}
                        icon={Clock}
                        hint="Segera jatuh tempo"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Buku terlambat</CardTitle>
                        <CardDescription>Belum dikembalikan sesuai tanggal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {overdueLoans && overdueLoans.length > 0 ? (
                            <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                        <TableHead>Telat</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overduePaging.paged.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="max-w-40 truncate font-medium">
                                                {loan.book}
                                            </TableCell>
                                            <TableCell className="max-w-32 truncate text-muted-foreground">
                                                {loan.member}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {loan.return_date}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">
                                                    {loan.days_overdue} hari
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {canBorrow && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setCircToExtend(loan);
                                                                setExtendDialogOpen(true);
                                                            }}
                                                        >
                                                            <CalendarPlus className="h-3.5 w-3.5" />
                                                            Perpanjang
                                                        </Button>
                                                    )}
                                                    {canReturn && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => confirmReturn(loan)}
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
                            <Pagination pagination={overduePaging} />
                            </>
                        ) : (
                            <EmptyState
                                icon={BookCheck}
                                title="Tidak ada buku terlambat"
                                description="Semua buku dikembalikan tepat waktu."
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Akan jatuh tempo</CardTitle>
                        <CardDescription>Harus kembali dalam 3 hari ke depan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dueSoonLoans && dueSoonLoans.length > 0 ? (
                            <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                        <TableHead>Sisa</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dueSoonPaging.paged.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="max-w-40 truncate font-medium">
                                                {loan.book}
                                            </TableCell>
                                            <TableCell className="max-w-32 truncate text-muted-foreground">
                                                {loan.member}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {loan.return_date}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {loan.days_until_due} hari
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {canBorrow && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setCircToExtend(loan);
                                                                setExtendDialogOpen(true);
                                                            }}
                                                        >
                                                            <CalendarPlus className="h-3.5 w-3.5" />
                                                            Perpanjang
                                                        </Button>
                                                    )}
                                                    {canReturn && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => confirmReturn(loan)}
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
                            <Pagination pagination={dueSoonPaging} />
                            </>
                        ) : (
                            <EmptyState
                                icon={Clock}
                                title="Tidak ada yang hampir terlambat"
                                description="Semua peminjaman dalam batas waktu."
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
