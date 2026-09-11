import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const statusFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'Tersedia', label: 'Tersedia' },
  { value: 'Dipinjam', label: 'Dipinjam' },
  { value: 'overdue', label: 'Terlambat' },
];

export default function BooksManagement({ books, stats }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredBooks = React.useMemo(() => {
    return books?.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'overdue' ? book.daysOverdue > 0 : book.status === statusFilter);
      
      return matchesSearch && matchesStatus;
    }) || [];
  }, [books, search, statusFilter]);

  const statusBadge = (book) => (
    <Badge className={cn('gap-1', book.statusClass)}>
      {book.daysOverdue > 0 ? <AlertCircle className="h-3 w-3" /> : book.isBorrowed ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
      {book.status}
    </Badge>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Kelola Buku - Status" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Kelola Buku</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pantau status ketersediaan buku, terlambat, dan hilang
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('books.index')}>
              Kelola Data Buku (CRUD)
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-lift">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stats?.total ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total Buku</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-lift">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stats?.available ?? 0}</p>
                <p className="text-sm text-muted-foreground">Tersedia</p>
              </div>
            </CardContent>
            </Card>
          <Card className="card-lift">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stats?.borrowed ?? 0}</p>
                <p className="text-sm text-muted-foreground">Dipinjam</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-lift">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive dark:text-destructive/80">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stats?.overdue ?? 0}</p>
                <p className="text-sm text-muted-foreground">Terlambat</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="card-lift">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari judul, pengarang, atau ID buku..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Status:
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card className="card-lift">
          <CardHeader>
            <CardTitle>Daftar Buku & Status</CardTitle>
            <CardDescription>
              Menampilkan {filteredBooks.length} dari {books?.length ?? 0} buku
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Judul Buku</TableHead>
                      <TableHead>Pengarang</TableHead>
                      <TableHead>Penerbit</TableHead>
                      <TableHead>Th. Terbit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Tgl Harus Kembali</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id} className="table-row-glow">
                        <TableCell className="font-mono text-sm font-medium">{book.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">{book.title}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground">{book.author}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground">{book.publisher}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{book.year}</TableCell>
                        <TableCell>{statusBadge(book)}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-muted-foreground">
                          {book.borrower}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {book.dueDate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <BookOpen className="h-7 w-7 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {search || statusFilter !== 'all' ? 'Tidak ada buku yang cocok' : 'Belum ada data buku'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}