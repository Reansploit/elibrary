import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
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

export default function MemberIndex({ members }) {
    const can = useCan();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const { delete: destroy, processing } = useForm();

    const filteredMembers = useMemo(() => {
        if (!search.trim()) return members || [];
        const q = search.toLowerCase();
        return (members || []).filter(
            (member) =>
                member.name?.toLowerCase().includes(q) ||
                member.id?.toLowerCase().includes(q) ||
                member.class?.toLowerCase().includes(q)
        );
    }, [members, search]);

    const paging = usePagination(filteredMembers);

    const confirmDelete = (member) => {
        setMemberToDelete(member);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!memberToDelete) return;
        destroy(route('members.destroy', memberToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setMemberToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Anggota" />

            <div className="space-y-6">
                <PageHeader
                    title="Anggota"
                    description="Kelola data anggota perpustakaan"
                    icon={Users}
                    actions={
                        can(['create_members', 'manage_members']) && (
                            <Button asChild>
                                <Link href={route('members.create')}>
                                    <Plus className="h-4 w-4" />
                                    Tambah anggota
                                </Link>
                            </Button>
                        )
                    }
                />

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar anggota</CardTitle>
                            <CardDescription>
                                {filteredMembers.length} dari {members?.length || 0} anggota
                                {search ? ` • hasil untuk "${search}"` : ''}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, RFID, kelas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredMembers.length > 0 ? (
                            <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Jenis kelamin</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={route('members.show', member.id)}
                                                    className="hover:underline"
                                                >
                                                    {member.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{member.gender}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.class || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {can(['edit_members', 'manage_members']) && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('members.edit', member.id)}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {can(['delete_members', 'manage_members']) && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => confirmDelete(member)}
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
                                icon={Users}
                                title={search ? 'Tidak ada hasil' : 'Belum ada data anggota'}
                                description={
                                    search
                                        ? `Tidak ditemukan anggota untuk "${search}".`
                                        : 'Tambah anggota baru untuk memulai.'
                                }
                                action={
                                    !search && can(['create_members', 'manage_members']) && (
                                        <Button size="sm" asChild>
                                            <Link href={route('members.create')}>
                                                <Plus className="h-4 w-4" />
                                                Tambah anggota
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
                title="Hapus anggota"
                description={
                    <>
                        Hapus anggota{' '}
                        <span className="font-medium text-foreground">{memberToDelete?.name}</span>?
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
