import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function MemberIndex({ members }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const { delete: destroy, processing } = useForm();

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!memberToDelete) return;
    // The members.destroy route name may vary — we'll infer from the pattern
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Anggota</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kelola data anggota perpustakaan
              </p>
            </div>
          </div>
          <Button asChild className="shine-sweep">
            <Link href={route('members.create')}>
              <Plus className="h-4 w-4" />
              Tambah Anggota
            </Link>
          </Button>
        </div>

        {/* Table */}
        <Card className="card-lift">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Anggota</CardTitle>
              <CardDescription>
                Total {members?.length || 0} anggota terdaftar
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              Anggota
            </Badge>
          </CardHeader>
          <CardContent>
            {members && members.length > 0 ? (
              <Table>
<TableHeader>
                   <TableRow>
                     <TableHead>RFID</TableHead>
                     <TableHead>Nama</TableHead>
                     <TableHead>Jenis Kelamin</TableHead>
                     <TableHead>Kelas</TableHead>
                     <TableHead className="text-right">Aksi</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} className="table-row-glow">
                      <TableCell className="font-mono text-xs font-medium">
                        {member.id}
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            member.gender === 'Laki-laki'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-pink-500/15 text-pink-600 dark:text-pink-400'
                          }
                        >
                          {member.gender}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.class || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={route('members.edit', member.id)}>
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(member)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-emerald-500/15">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <span className="sparkle right-1 top-2" />
                  <span className="sparkle bottom-2 left-2" style={{ animationDelay: '0.8s' }} />
                </div>
                <p className="text-sm font-medium">Belum ada data anggota</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tambah anggota baru untuk memulai
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href={route('members.create')}>
                    <Plus className="h-4 w-4" />
                    Tambah Anggota
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </span>
              Hapus Anggota
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus anggota{' '}
              <span className="font-medium text-foreground">
                {memberToDelete?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={processing}
            >
              {processing ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
