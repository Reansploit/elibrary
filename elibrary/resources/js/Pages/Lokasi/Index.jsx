import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Search } from 'lucide-react';
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

export default function LokasiIndex({ locations }) {
    const can = useCan();
    const canManage = can('manage_books');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const { delete: destroy, processing } = useForm();

    const filtered = useMemo(() => {
        if (!search.trim()) return locations || [];
        const q = search.toLowerCase();
        return (locations || []).filter(
            (loc) =>
                loc.name?.toLowerCase().includes(q) ||
                loc.id?.toLowerCase().includes(q)
        );
    }, [locations, search]);

    const paging = usePagination(filtered);

    const confirmDelete = (location) => {
        setLocationToDelete(location);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!locationToDelete) return;
        destroy(route('lokasi.destroy', locationToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setLocationToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lokasi" />

            <div className="space-y-6">
                <PageHeader
                    title="Lokasi"
                    description="Kelola rak/lokasi penyimpanan buku"
                    icon={MapPin}
                    actions={
                        canManage && (
                            <Button asChild>
                                <Link href={route('lokasi.create')}>
                                    <Plus className="h-4 w-4" />
                                    Tambah lokasi
                                </Link>
                            </Button>
                        )
                    }
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar lokasi</CardTitle>
                            <CardDescription>
                                {filtered.length} dari {locations?.length || 0} lokasi
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
                                    {paging.paged.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell className="font-mono text-xs">
                                                {location.id}
                                            </TableCell>
                                            <TableCell className="font-medium">{location.name}</TableCell>
                                            <TableCell className="max-w-48 truncate text-muted-foreground">
                                                {location.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">
                                                    {location.books_count ?? 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <>
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={route('lokasi.edit', location.id)}>
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => confirmDelete(location)}
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
                                icon={MapPin}
                                title={search ? 'Tidak ada hasil' : 'Belum ada lokasi'}
                                description={
                                    search
                                        ? `Tidak ditemukan lokasi untuk "${search}".`
                                        : 'Tambah lokasi rak untuk memulai.'
                                }
                                action={
                                    !search && canManage && (
                                        <Button size="sm" asChild>
                                            <Link href={route('lokasi.create')}>
                                                <Plus className="h-4 w-4" />
                                                Tambah lokasi
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
                title="Hapus lokasi"
                description={
                    <>
                        Hapus lokasi{' '}
                        <span className="font-medium text-foreground">{locationToDelete?.name}</span>?
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
