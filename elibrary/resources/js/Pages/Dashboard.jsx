import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    BookCheck,
    AlertCircle,
    ArrowRight,
    RotateCcw,
    Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import StatCard from '@/components/stat-card';
import EmptyState from '@/components/empty-state';
import GlobalSearch from '@/components/global-search';
import { useCan } from '@/hooks/useCan';

const quickActions = [
    {
        label: 'Pinjam Buku',
        desc: 'Catat peminjaman baru',
        icon: BookOpen,
        href: 'circulation.create',
        primary: true,
        permission: ['borrow_books'],
    },
    {
        label: 'Kembalikan Buku',
        desc: 'Proses pengembalian',
        icon: RotateCcw,
        href: 'circulation.index',
        permission: ['return_books'],
    },
    {
        label: 'Cek Terlambat',
        desc: 'Lihat keterlambatan',
        icon: AlertCircle,
        href: 'circulation.overdue',
        permission: ['view_circulation'],
    },
    {
        label: 'Kelola Buku',
        desc: 'Tambah & ubah koleksi',
        icon: BookOpen,
        href: 'books.index',
        permission: ['view_books', 'manage_books'],
    },
    {
        label: 'Kelola Anggota',
        desc: 'Data anggota aktif',
        icon: Users,
        href: 'members.index',
        permission: ['view_members', 'manage_members'],
    },
    {
        label: 'Riwayat Sirkulasi',
        desc: 'Semua transaksi',
        icon: ArrowRight,
        href: 'circulation.index',
        permission: ['view_circulation'],
    },
];

function getDaysOverdue(returnDate) {
    if (!returnDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(returnDate);
    due.setHours(0, 0, 0, 0);
    const diff = today - due;
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

export default function Dashboard({ stats, recentLoans, overdueLoans, dueSoonLoans }) {
    const can = useCan();

    const visibleActions = quickActions.filter((action) => can(action.permission));

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <GlobalSearch />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total buku"
                        value={stats?.totalBooks ?? 0}
                        icon={BookOpen}
                        hint="Koleksi terdaftar"
                    />
                    <StatCard
                        label="Terlambat"
                        value={stats?.totalOverdue ?? 0}
                        icon={AlertCircle}
                        hint="Perlu ditindaklanjuti"
                    />
                    <StatCard
                        label="Jatuh tempo"
                        value={stats?.totalDueSoon ?? 0}
                        icon={Clock}
                        hint="≤ 3 hari ke depan"
                    />
                    <StatCard
                        label="Sudah kembali"
                        value={stats?.totalReturned ?? 0}
                        icon={BookCheck}
                        hint="Transaksi selesai"
                    />
                </div>

                {visibleActions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick action</CardTitle>
                            <CardDescription>Pintasan ke alur yang paling sering dipakai</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {visibleActions.map((action) => (
                                <Button
                                    key={action.label}
                                    variant={action.primary ? 'default' : 'outline'}
                                    asChild
                                    className="h-auto justify-start p-3"
                                >
                                    <Link href={route(action.href)}>
                                        <action.icon className="h-4 w-4 shrink-0" />
                                        <span className="min-w-0 text-left">
                                            <span className="block truncate text-sm font-medium">
                                                {action.label}
                                            </span>
                                            <span className="block truncate text-xs font-normal opacity-70">
                                                {action.desc}
                                            </span>
                                        </span>
                                    </Link>
                                </Button>
                            ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Terlambat</CardTitle>
                                <CardDescription>Melewati tanggal kembali</CardDescription>
                            </div>
                            <Badge variant="destructive">{overdueLoans?.length || 0} kasus</Badge>
                        </CardHeader>
                        <CardContent>
                            {overdueLoans && overdueLoans.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Buku</TableHead>
                                            <TableHead>Anggota</TableHead>
                                            <TableHead>Tgl kembali</TableHead>
                                            <TableHead className="text-right">Telat</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overdueLoans.slice(0, 5).map((loan) => {
                                            const days =
                                                loan.days_overdue ?? getDaysOverdue(loan.return_date);
                                            return (
                                                <TableRow key={loan.id}>
                                                    <TableCell className="max-w-36 truncate font-medium">
                                                        {loan.book}
                                                    </TableCell>
                                                    <TableCell className="max-w-28 truncate text-muted-foreground">
                                                        {loan.member}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {loan.return_date}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="destructive">
                                                            {days} hari
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={BookCheck}
                                    title="Tidak ada keterlambatan"
                                    description="Semua buku dikembalikan tepat waktu."
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Jatuh tempo</CardTitle>
                                <CardDescription>≤ 3 hari ke depan</CardDescription>
                            </div>
                            <Badge variant="secondary">{dueSoonLoans?.length || 0} kasus</Badge>
                        </CardHeader>
                        <CardContent>
                            {dueSoonLoans && dueSoonLoans.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Buku</TableHead>
                                            <TableHead>Anggota</TableHead>
                                            <TableHead>Tgl kembali</TableHead>
                                            <TableHead className="text-right">Sisa</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dueSoonLoans.slice(0, 5).map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell className="max-w-36 truncate font-medium">
                                                    {loan.book}
                                                </TableCell>
                                                <TableCell className="max-w-28 truncate text-muted-foreground">
                                                    {loan.member}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {loan.return_date}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="secondary">
                                                        {loan.days_until_due ?? 0} hari
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={Clock}
                                    title="Belum ada yang harus dikembalikan"
                                    description="Semua peminjaman masih dalam batas waktu."
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Peminjaman terbaru</CardTitle>
                        <CardDescription>Transaksi terakhir di perpustakaan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentLoans && recentLoans.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead>Tgl pinjam</TableHead>
                                        <TableHead>Tgl kembali</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLoans.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="max-w-40 truncate font-medium">
                                                {loan.book}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {loan.member}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {loan.borrow_date}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {loan.return_date}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        loan.status === 'PIN' ? 'secondary' : 'outline'
                                                    }
                                                >
                                                    {loan.status === 'PIN' ? 'Dipinjam' : 'Kembali'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada peminjaman"
                                description="Lakukan peminjaman buku untuk memulai."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
