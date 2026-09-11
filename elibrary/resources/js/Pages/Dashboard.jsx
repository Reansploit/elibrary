import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  BookCheck,
  BookX,
  ArrowRight,
  Sparkles,
  LibraryBig,
  TrendingUp,
  CircleCheck,
  ArrowUpRight,
  AlertCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

const statCards = [
  {
    label: 'Total Buku',
    icon: BookOpen,
    key: 'totalBooks',
    gradient: 'from-blue-500 to-blue-600',
    softBg: 'bg-blue-100 dark:bg-blue-950/60',
    glow: 'rgba(59,130,246,0.35)',
  },
  {
    label: 'Buku Terlambat',
    icon: AlertCircle,
    key: 'totalOverdue',
    gradient: 'from-rose-500 to-red-600',
    softBg: 'bg-rose-100 dark:bg-rose-950/60',
    glow: 'rgba(244,63,94,0.35)',
  },
  {
    label: 'Jatuh Tempo',
    icon: Clock,
    key: 'totalDueSoon',
    gradient: 'from-amber-500 to-orange-600',
    softBg: 'bg-amber-100 dark:bg-amber-950/60',
    glow: 'rgba(245,158,11,0.35)',
  },
  {
    label: 'Sudah Kembali',
    icon: BookCheck,
    key: 'totalReturned',
    gradient: 'from-violet-500 to-purple-600',
    softBg: 'bg-violet-100 dark:bg-violet-950/60',
    glow: 'rgba(139,92,246,0.35)',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard({ stats, recentLoans, overdueLoans, dueSoonLoans }) {
  const { props } = usePage();
  const user = props.auth.user;
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  })();

  // Helper to calculate days overdue
  const getDaysOverdue = (returnDate) => {
    if (!returnDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(returnDate);
    due.setHours(0, 0, 0, 0);
    const diff = today - due;
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Welcome Banner */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent p-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30"
                >
                  <LibraryBig className="h-6 w-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">
                      {greeting}, {firstName}
                    </h1>
                    <motion.span
                      animate={{ rotate: [0, 15, -10, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                    </motion.span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selamat datang kembali di perpustakaan digitalmu
                  </p>
                </div>
              </div>
              <Button asChild className="shine-sweep gap-1.5">
                <Link href={route('circulation.create')}>
                  <BookX className="h-4 w-4" />
                  Pinjam Buku
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.key}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card
                className="card-lift relative overflow-hidden"
                style={{ '--glow-color': card.glow }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-xl" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </CardTitle>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
                      className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} p-2 text-white shadow-md`}
                    >
                      <card.icon className="h-4 w-4" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold tracking-tight">
                      {stats?.[card.key] ?? 0}
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={`inline-block h-2 w-2 rounded-full ${card.softBg}`} />
                    Data perpustakaan
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions - Moved up */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Quick Action</CardTitle>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Shortcut
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Button variant="default" asChild className="h-auto flex-col items-start gap-2 p-4 text-left">
                  <Link href={route('circulation.create')}>
                    <span className="flex items-center gap-2">
                      <BookX className="h-4 w-4" />
                      Pinjam Buku
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      Catat peminjaman baru
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-4 text-left">
                  <Link href={route('circulation.index')}>
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Kembalikan Buku
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      Kembali dan cek terlambat
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-4 text-left">
                  <Link href={route('circulation.overdue')}>
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Cek Terlambat
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      Lihat yang terlambat
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-4 text-left">
                  <Link href={route('books.index')}>
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Kelola Buku
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      Tambah & ubah koleksi
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-4 text-left">
                  <Link href={route('members.index')}>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Kelola Anggota
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      Data anggota aktif
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-4 text-left">
                  <Link href={route('circulation.index')}>
                    <span className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Lihat Sirkulasi
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      Riwayat peminjaman
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overdue Borrowers + Due Soon + Recent Loans */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Overdue Borrowers */}
          <motion.div variants={item} className="lg:col-span-6">
            <Card className="h-full">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Terlambat Pengembalian
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Buku yang melewati tanggal kembalikan
                  </p>
                </div>
                <Badge variant="destructive" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {overdueLoans?.length || 0} kasus
                </Badge>
              </CardHeader>
              <CardContent>
                {overdueLoans && overdueLoans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buku</TableHead>
                        <TableHead>Anggota</TableHead>
                        <TableHead className="text-center">Tgl Kembali</TableHead>
                        <TableHead className="text-center">Terlambat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueLoans.slice(0, 5).map((loan) => {
                        const daysOverdue = loan.days_overdue || getDaysOverdue(loan.return_date);
                        return (
                          <TableRow key={loan.id} className="table-row-glow">
                            <TableCell className="max-w-[150px] truncate font-medium">
                              {loan.book}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-muted-foreground">
                              {loan.member}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {loan.return_date}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="destructive" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {daysOverdue} hari
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-48 items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-emerald-500/15 p-3">
                        <CircleCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Tidak ada yang terlambat
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Semua buku dikembalikan tepat waktu
                      </p>
                    </div>
                  </div>
                )}
                {overdueLoans && overdueLoans.length > 5 && (
                  <div className="mt-3 text-center">
                    <Button variant="link" size="sm" asChild>
                      <Link href={route('circulation.index')}>Lihat semua {overdueLoans.length} kasus</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Due Soon */}
          <motion.div variants={item} className="lg:col-span-6">
            <Card className="h-full">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Akan Jatuh Tempo
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Buku yang harus dikembalikan dalam 3 hari ke depan
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  {dueSoonLoans?.length || 0} kasus
                </Badge>
              </CardHeader>
              <CardContent>
                {dueSoonLoans && dueSoonLoans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buku</TableHead>
                        <TableHead>Anggota</TableHead>
                        <TableHead className="text-center">Tgl Kembali</TableHead>
                        <TableHead className="text-center">Sisa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dueSoonLoans.slice(0, 5).map((loan) => {
                        const daysUntilDue = loan.days_until_due ?? Math.abs(getDaysOverdue(loan.return_date));
                        return (
                          <TableRow key={loan.id} className="table-row-glow">
                            <TableCell className="max-w-[150px] truncate font-medium">
                              {loan.book}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-muted-foreground">
                              {loan.member}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {loan.return_date}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="gap-1">
                                {daysUntilDue} hari
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-48 items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-emerald-500/15 p-3">
                        <CircleCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Tidak ada buku mendekati deadline
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Semua peminjaman dalam batas waktu
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Loans */}
        <motion.div variants={item}>
          <Card className="card-lift">
            <CardHeader>
              <CardTitle>Peminjaman Terbaru</CardTitle>
              <p className="text-xs text-muted-foreground">
                Transaksi terakhir di perpustakaan
              </p>
            </CardHeader>
            <CardContent>
              {recentLoans && recentLoans.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buku</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead>Tgl Pinjam</TableHead>
                      <TableHead>Tgl Kembali</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLoans.map((loan) => (
                      <TableRow key={loan.id} className="table-row-glow">
                        <TableCell className="max-w-[120px] truncate font-medium">
                          {loan.book}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{loan.member}</TableCell>
                        <TableCell className="text-muted-foreground">{loan.borrow_date}</TableCell>
                        <TableCell className="text-muted-foreground">{loan.return_date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={loan.status === 'PIN' ? 'default' : 'secondary'}
                            className={loan.status === 'PIN'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}
                          >
                            {loan.status === 'PIN' ? 'Dipinjam' : 'Kembali'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Belum ada peminjaman
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lakukan peminjaman buku untuk memulai
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AuthenticatedLayout>
  );
}
