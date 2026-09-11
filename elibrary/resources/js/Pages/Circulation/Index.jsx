import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, RotateCcw, ArrowLeftRight, CircleCheck, ArrowUpRight, AlertCircle } from 'lucide-react';
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

export default function CirculationIndex({ circulations }) {
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [circToReturn, setCircToReturn] = useState(null);
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
      <Head title="Sirkulasi" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Sirkulasi</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Data peminjaman dan pengembalian buku
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-1.5">
              <Link href={route('circulation.overdue')}>
                <AlertCircle className="h-4 w-4" />
                Cek Terlambat
              </Link>
            </Button>
            <Button asChild className="shine-sweep gap-1.5">
              <Link href={route('circulation.create')}>
                <Plus className="h-4 w-4" />
                Pinjam Buku
              </Link>
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="card-lift">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Sirkulasi</CardTitle>
              <CardDescription>
                Total {circulations?.length || 0} transaksi
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <ArrowLeftRight className="h-3 w-3" />
              Transaksi
            </Badge>
          </CardHeader>
          <CardContent>
            {circulations && circulations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Buku</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Tgl Pinjam</TableHead>
                    <TableHead>Tgl Kembali</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circulations.map((circ) => (
                    <TableRow key={circ.id} className="table-row-glow">
                      <TableCell className="font-mono text-xs font-medium">
                        {circ.id}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate font-medium">
                        {circ.book}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-muted-foreground">
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
                          className={
                            circ.status === 'PIN'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {circ.status === 'PIN' ? (
                            <CircleCheck className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          )}
                          {circ.status === 'PIN' ? 'Dipinjam' : 'Kembali'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {circ.status === 'PIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmReturn(circ)}
                              disabled={processing}
                              className="gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-amber-500/15">
                    <ArrowLeftRight className="h-7 w-7 text-primary" />
                  </div>
                  <span className="sparkle right-1 top-2" />
                  <span className="sparkle bottom-2 left-2" style={{ animationDelay: '0.8s' }} />
                </div>
                <p className="text-sm font-medium">Belum ada transaksi</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lakukan peminjaman buku untuk memulai
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href={route('circulation.create')}>
                    <Plus className="h-4 w-4" />
                    Pinjam Buku
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Return Confirmation Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              Konfirmasi Pengembalian
            </DialogTitle>
            <DialogDescription>
              Tandai buku{' '}
              <span className="font-medium text-foreground">{circToReturn?.book}</span>{' '}
              yang dipinjam oleh{' '}
              <span className="font-medium text-foreground">{circToReturn?.member}</span>{' '}
              sebagai kembali?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleReturn} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
              <RotateCcw className="h-4 w-4" />
              {processing ? 'Memproses...' : 'Kembalikan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
