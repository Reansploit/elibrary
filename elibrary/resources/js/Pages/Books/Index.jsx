import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Search, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

export default function BookIndex({ books }) {
    const can = useCan();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const { delete: destroy, processing } = useForm();

    const filteredBooks = useMemo(() => {
        if (!search.trim()) return books || [];
        const q = search.toLowerCase();
        return (books || []).filter(
            (book) =>
                book.title?.toLowerCase().includes(q) ||
                book.author?.toLowerCase().includes(q) ||
                book.id?.toLowerCase().includes(q) ||
                book.location?.toLowerCase().includes(q)
        );
    }, [books, search]);

    const paging = usePagination(filteredBooks);

    const confirmDelete = (book) => {
        setBookToDelete(book);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!bookToDelete) return;
        destroy(route('books.destroy', bookToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setBookToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buku" />

            <div className="space-y-6">
                <PageHeader
                    title="Buku"
                    description="Kelola data buku perpustakaan"
                    icon={BookOpen}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={route('books.management')}>
                                    <BarChart2 className="h-4 w-4" />
                                    Status buku
                                </Link>
                            </Button>
                            {can(['create_books', 'manage_books']) && (
                                <Button asChild>
                                    <Link href={route('books.create')}>
                                        <Plus className="h-4 w-4" />
                                        Tambah buku
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar buku</CardTitle>
                            <CardDescription>
                                {filteredBooks.length} dari {books?.length || 0} buku
                                {search ? ` • hasil untuk "${search}"` : ''}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari judul, pengarang, ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredBooks.length > 0 ? (
                            <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Pengarang</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead className="text-center">Jumlah</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((book) => (
                                        <TableRow key={book.id}>
                                            <TableCell className="font-mono text-xs">
                                                {book.id}
                                            </TableCell>
                                            <TableCell className="max-w-52 truncate font-medium">
                                                <Link
                                                    href={route('books.show', book.id)}
                                                    className="hover:underline"
                                                >
                                                    {book.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="max-w-40 truncate text-muted-foreground">
                                                {book.author || '-'}
                                            </TableCell>
                                            <TableCell className="max-w-32 truncate text-muted-foreground">
                                                {book.location || '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {book.stock ?? 0}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {can(['edit_books', 'manage_books']) && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('books.edit', book.id)}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {can(['delete_books', 'manage_books']) && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => confirmDelete(book)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Hapus
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
                                icon={BookOpen}
                                title={search ? 'Tidak ada hasil' : 'Belum ada data buku'}
                                description={
                                    search
                                        ? `Tidak ditemukan buku untuk "${search}".`
                                        : 'Tambah buku baru untuk memulai.'
                                }
                                action={
                                    !search && can(['create_books', 'manage_books']) && (
                                        <Button size="sm" asChild>
                                            <Link href={route('books.create')}>
                                                <Plus className="h-4 w-4" />
                                                Tambah buku
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
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Hapus buku"
                description={
                    <>
                        Hapus buku <span className="font-medium text-foreground">{bookToDelete?.title}</span>?
                        Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                confirmLabel="Hapus"
                onConfirm={handleDelete}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
