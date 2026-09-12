import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import StatCard from '@/components/stat-card';
import Pagination from '@/components/pagination';
import { usePagination } from '@/hooks/usePagination';

const statusFilters = [
    { value: 'all', label: 'Semua status' },
    { value: 'Tersedia', label: 'Tersedia' },
    { value: 'Dipinjam', label: 'Dipinjam' },
    { value: 'overdue', label: 'Terlambat' },
];

function StatusBadge({ book }) {
    if (book.daysOverdue > 0) return <Badge variant="destructive">{book.status}</Badge>;
    if (book.isBorrowed) return <Badge variant="secondary">{book.status}</Badge>;
    return <Badge variant="outline">{book.status}</Badge>;
}

export default function BooksManagement({ books, stats }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredBooks = useMemo(() => {
        return (
            books?.filter((book) => {
                const q = search.toLowerCase();
                const matchesSearch =
                    !q ||
                    book.title?.toLowerCase().includes(q) ||
                    book.author?.toLowerCase().includes(q) ||
                    book.id?.toLowerCase().includes(q);

                const matchesStatus =
                    statusFilter === 'all' ||
                    (statusFilter === 'overdue' ? book.daysOverdue > 0 : book.status === statusFilter);

                return matchesSearch && matchesStatus;
            }) || []
        );
    }, [books, search, statusFilter]);

    const paging = usePagination(filteredBooks);

    return (
        <AuthenticatedLayout>
            <Head title="Status Buku" />

            <div className="space-y-6">
                <PageHeader
                    title="Status buku"
                    description="Pantau ketersediaan dan keterlambatan"
                    icon={BookOpen}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('books.index')}>Kelola data buku</Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total" value={stats?.total ?? 0} />
                    <StatCard label="Tersedia" value={stats?.available ?? 0} />
                    <StatCard label="Dipinjam" value={stats?.borrowed ?? 0} />
                    <StatCard label="Terlambat" value={stats?.overdue ?? 0} />
                </div>

                <Card>
                    <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari judul, pengarang, atau ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-44">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar buku & status</CardTitle>
                        <CardDescription>
                            {filteredBooks.length} dari {books?.length ?? 0} buku
                        </CardDescription>
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
                                        <TableHead>Status</TableHead>
                                        <TableHead>Peminjam</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paging.paged.map((book) => (
                                        <TableRow key={book.id}>
                                            <TableCell className="font-mono text-xs">{book.id}</TableCell>
                                            <TableCell className="max-w-48 truncate font-medium">
                                                {book.title}
                                            </TableCell>
                                            <TableCell className="max-w-36 truncate text-muted-foreground">
                                                {book.author}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge book={book} />
                                            </TableCell>
                                            <TableCell className="max-w-28 truncate text-muted-foreground">
                                                {book.borrower || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {book.dueDate || '-'}
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
                                title="Tidak ada buku yang cocok"
                                description="Ubah kata kunci atau filter status."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
