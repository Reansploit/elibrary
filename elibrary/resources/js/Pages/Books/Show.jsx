import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Pencil, BookOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';
import PhotoThumb from '@/components/photo-thumb';
import { useCan } from '@/hooks/useCan';

function InfoRow({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-medium">{children}</span>
        </div>
    );
}

const EXEMPLAR_LABEL = {
    tersedia: 'Tersedia',
    dipinjam: 'Dipinjam',
    hilang: 'Hilang',
    rusak: 'Rusak',
};

const EXEMPLAR_VARIANT = {
    tersedia: 'outline',
    dipinjam: 'secondary',
    hilang: 'destructive',
    rusak: 'destructive',
};

export default function BookShow({ book, history, exemplars }) {
    const can = useCan();
    const canEdit = can(['edit_books', 'manage_books']);
    const { post, processing: adding } = useForm();
    const [updatingId, setUpdatingId] = useState(null);
    const { delete: destroy, processing: deleting } = useForm();
    const [deleteTarget, setDeleteTarget] = useState(null);

    const setStatus = (e) => {
        setUpdatingId(e.id);
        router.put(route('exemplars.update', e.id), { status: e.status }, {
            onFinish: () => setUpdatingId(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={book.title} />

            <div className="space-y-6">
                <PageHeader
                    title={book.title}
                    description="Detail buku"
                    icon={BookOpen}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={route('books.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {can(['edit_books', 'manage_books']) && (
                                <Button asChild>
                                    <Link href={route('books.edit', book.id)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                            <PhotoThumb
                                src={book.photo}
                                alt={book.title}
                                icon={BookOpen}
                                className="h-32 w-32 rounded-xl"
                            />
                            <div>
                                <p className="font-semibold">{book.title}</p>
                                <p className="font-mono text-xs text-muted-foreground">{book.id}</p>
                            </div>
                            {!book.borrowed ? (
                                <Badge variant="outline">Tersedia</Badge>
                            ) : (
                                <Badge variant="secondary">
                                    {book.remaining > 0
                                        ? `Dipinjam • sisa ${book.remaining}`
                                        : 'Dipinjam semua'}
                                    {book.borrower ? ` • ${book.borrower}` : ''}
                                    {book.due ? ` • jatuh tempo ${book.due}` : ''}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <InfoRow label="ID buku">{book.id}</InfoRow>
                            <InfoRow label="Judul">{book.title}</InfoRow>
                            <InfoRow label="Pengarang">{book.author || '-'}</InfoRow>
                            <InfoRow label="Lokasi">{book.location || '-'}</InfoRow>
                            <InfoRow label="Jumlah">{book.stock ?? 0}</InfoRow>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Eksemplar</CardTitle>
                            <CardDescription>
                                Tiap unit buku punya kode dan status sendiri — tandai hilang/rusak di sini
                            </CardDescription>
                        </div>
                        {canEdit && (
                            <Button
                                size="sm"
                                onClick={() => post(route('exemplars.store', book.id))}
                                disabled={adding}
                            >
                                <Plus className="h-4 w-4" />
                                {adding ? 'Menambah...' : 'Tambah eksemplar'}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {exemplars?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Peminjam</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exemplars.map((e) => (
                                        <TableRow key={e.id}>
                                            <TableCell className="font-mono text-xs font-medium">
                                                {e.code}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={EXEMPLAR_VARIANT[e.status] || 'outline'}>
                                                    {EXEMPLAR_LABEL[e.status] || e.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {e.status === 'dipinjam' ? e.borrower || '-' : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {canEdit && e.status === 'tersedia' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={updatingId === e.id}
                                                                onClick={() => setStatus({ id: e.id, status: 'hilang' })}
                                                            >
                                                                Hilang
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={updatingId === e.id}
                                                                onClick={() => setStatus({ id: e.id, status: 'rusak' })}
                                                            >
                                                                Rusak
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                disabled={deleting}
                                                                onClick={() => setDeleteTarget(e)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {canEdit && (e.status === 'hilang' || e.status === 'rusak') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={updatingId === e.id}
                                                            onClick={() => setStatus({ id: e.id, status: 'tersedia' })}
                                                        >
                                                            Jadi baik
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada eksemplar"
                                description="Tambah eksemplar agar buku ini bisa dipinjam."
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat peminjaman</CardTitle>
                        <CardDescription>10 transaksi terakhir buku ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Peminjam</TableHead>
                                        <TableHead>Eksemplar</TableHead>
                                        <TableHead>Tgl pinjam</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((h) => (
                                        <TableRow key={h.id}>
                                            <TableCell className="font-medium">{h.member}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {h.exemplar || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {h.borrow_date}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {h.return_date}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={h.status === 'PIN' ? 'secondary' : 'outline'}>
                                                    {h.status === 'PIN' ? 'Dipinjam' : 'Kembali'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum pernah dipinjam"
                                description="Belum ada riwayat peminjaman untuk buku ini."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Hapus eksemplar"
                description={
                    <>
                        Hapus eksemplar{' '}
                        <span className="font-mono font-medium text-foreground">
                            {deleteTarget?.code}
                        </span>
                        ?
                    </>
                }
                confirmLabel="Hapus"
                processing={deleting}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    destroy(route('exemplars.destroy', deleteTarget.id), {
                        onSuccess: () => setDeleteTarget(null),
                    });
                }}
            />
        </AuthenticatedLayout>
    );
}
