import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
  AlertCircle,
  Clock,
  RotateCcw,
  CircleCheck,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function Overdue({ overdueLoans, dueSoonLoans }) {
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
      <Head title="Peminjaman Terlambat" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25">
              <AlertCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Peminjaman Terlambat
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Buku yang melewati tanggal pengembalian
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href={route('dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Terlambat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-destructive">
                  {overdueLoans?.length || 0}
                </div>
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3" />
                  Terlambat
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Akan Jatuh Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-amber-600">
                  {dueSoonLoans?.length || 0}
                </div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3" />
                  3 Hari
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Loans Table */}
        <Card className="card-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Daftar Buku Terlambat
            </CardTitle>
            <CardDescription>
              Buku yang belum dikembalikan sesuai tanggal yang ditentukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueLoans && overdueLoans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Buku</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Tgl Pinjam</TableHead>
                    <TableHead>Tgl Kembali</TableHead>
                    <TableHead>Terlambat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueLoans.map((loan) => (
                    <TableRow key={loan.id} className="table-row-glow">
                      <TableCell className="font-mono text-xs font-medium">
                        {loan.id}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate font-medium">
                        {loan.book}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-muted-foreground">
                        {loan.member}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.borrow_date}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="text-destructive font-medium">{loan.return_date}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {loan.days_overdue} hari
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmReturn(loan)}
                            disabled={processing}
                            className="gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Kembali
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/15 to-emerald-600/15">
                    <CircleCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-medium">Tidak ada buku terlambat</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Semua buku dikembalikan tepat waktu
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Soon Loans */}
        <Card className="card-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Akan Jatuh Tempo (3 Hari Ke Depan)
            </CardTitle>
            <CardDescription>
              Buku yang harus dikembalikan dalam 3 hari ke depan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dueSoonLoans && dueSoonLoans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Buku</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Tgl Pinjam</TableHead>
                    <TableHead>Tgl Kembali</TableHead>
                    <TableHead>Sisa Hari</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dueSoonLoans.map((loan) => (
                    <TableRow key={loan.id} className="table-row-glow">
                      <TableCell className="font-mono text-xs font-medium">
                        {loan.id}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate font-medium">
                        {loan.book}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-muted-foreground">
                        {loan.member}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.borrow_date}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.return_date}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {loan.days_until_due} hari
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmReturn(loan)}
                            disabled={processing}
                            className="gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Kembali
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/15 to-emerald-600/15">
                    <CircleCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-medium">Tidak ada buku mendekati deadline</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Semua peminjaman dalam batas waktu
                </p>
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
