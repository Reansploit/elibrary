import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, BarChart2 } from 'lucide-react';
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

export default function BookIndex({ books }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const { delete: destroy, processing } = useForm();

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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Buku</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kelola data buku perpustakaan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="gap-1.5">
              <Link href={route('books.management')}>
                <BarChart2 className="h-4 w-4" />
                Status Buku
              </Link>
            </Button>
            <Button asChild className="shine-sweep">
              <Link href={route('books.create')}>
                <Plus className="h-4 w-4" />
                Tambah Buku
              </Link>
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="card-lift">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Buku</CardTitle>
              <CardDescription>
                Total {books?.length || 0} buku terdaftar
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              Koleksi
            </Badge>
          </CardHeader>
          <CardContent>
            {books && books.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Buku</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Pengarang</TableHead>
                    <TableHead>Penerbit</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id} className="table-row-glow">
                      <TableCell className="font-mono text-xs font-medium">
                        {book.id}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {book.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {book.author || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {book.publisher || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary/20 bg-primary/5 text-primary"
                        >
                          {book.year}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={route('books.edit', book.id)}>
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(book)}
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-violet-500/15">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>
                  <span className="sparkle right-1 top-2" />
                  <span className="sparkle bottom-2 left-2" style={{ animationDelay: '0.8s' }} />
                </div>
                <p className="text-sm font-medium">Belum ada data buku</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tambah buku baru untuk memulai
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href={route('books.create')}>
                    <Plus className="h-4 w-4" />
                    Tambah Buku
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
              Hapus Buku
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus buku{' '}
              <span className="font-medium text-foreground">
                {bookToDelete?.title}
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
