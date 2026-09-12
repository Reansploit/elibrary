import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
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

export default function BookShow({ book, history }) {
    const can = useCan();

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
                            <InfoRow label="Jumlah">{book.stock ?? 0}</InfoRow>
                        </CardContent>
                    </Card>
                </div>

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
                                        <TableHead>Tgl pinjam</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((h) => (
                                        <TableRow key={h.id}>
                                            <TableCell className="font-medium">{h.member}</TableCell>
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
        </AuthenticatedLayout>
    );
}
