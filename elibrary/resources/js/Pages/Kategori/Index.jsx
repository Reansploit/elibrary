import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Tags, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

export default function KategoriIndex({ categories }) {
    const can = useCan();
    const canManage = can('manage_books');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const { delete: destroy, processing } = useForm();

    const filtered = useMemo(() => {
        if (!search.trim()) return categories || [];
        const q = search.toLowerCase();
        return (categories || []).filter(
            (cat) =>
                cat.name?.toLowerCase().includes(q) ||
                cat.id?.toLowerCase().includes(q)
        );
    }, [categories, search]);

    const paging = usePagination(filtered);

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;
        destroy(route('kategori.destroy', categoryToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kategori" />

            <div className="space-y-6">
                <PageHeader
                    title="Kategori"
                    description="Kelompok kitab/buku: fikih, akidah, sirah, dan lainnya"
                    icon={Tags}
                    actions={
                        canManage && (
                            <Button asChild>
                                <Link href={route('kategori.create')}>
                                    <Plus className="h-4 w-4" />
                                    Tambah kategori
                                </Link>
                            </Button>
                        )
                    }
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar kategori</CardTitle>
                            <CardDescription>
                                {filtered.length} dari {categories?.length || 0} kategori
                                {search ? ` • hasil untuk "${search}"` : ''}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode atau nama…"
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
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className="text-center">Buku</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-mono text-xs">
                                                {category.id}
                                            </TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="max-w-48 truncate text-muted-foreground">
                                                {category.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">
                                                    {category.books_count ?? 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <>
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={route('kategori.edit', category.id)}>
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => confirmDelete(category)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Hapus
                                                            </Button>
                                                        </>
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
                                icon={Tags}
                                title={search ? 'Tidak ada hasil' : 'Belum ada kategori'}
                                description={
                                    search
                                        ? `Tidak ditemukan kategori untuk "${search}".`
                                        : 'Tambah kategori untuk memulai.'
                                }
                                action={
                                    !search && canManage && (
                                        <Button size="sm" asChild>
                                            <Link href={route('kategori.create')}>
                                                <Plus className="h-4 w-4" />
                                                Tambah kategori
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
                title="Hapus kategori"
                description={
                    <>
                        Hapus kategori{' '}
                        <span className="font-medium text-foreground">{categoryToDelete?.name}</span>?
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
