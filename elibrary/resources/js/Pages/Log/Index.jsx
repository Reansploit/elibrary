import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ScrollText, Search, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import Pagination from '@/components/pagination';
import { usePagination } from '@/hooks/usePagination';

const ACTION_VARIANT = {
    tambah: 'outline',
    ubah: 'secondary',
    hapus: 'destructive',
};

const ACTION_LABEL = {
    tambah: 'Tambah',
    ubah: 'Ubah',
    hapus: 'Hapus',
};

export default function LogIndex({ logs, audits }) {
    const [tab, setTab] = useState('transaksi');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('semua');

    const filtered = useMemo(() => {
        let rows = logs || [];
        if (filter === 'aktif') rows = rows.filter((l) => !l.done);
        if (filter === 'selesai') rows = rows.filter((l) => l.done);
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(
                (l) => l.book?.toLowerCase().includes(q) || l.member?.toLowerCase().includes(q)
            );
        }
        return rows;
    }, [logs, search, filter]);

    const filteredAudits = useMemo(() => {
        if (!search.trim()) return audits || [];
        const q = search.toLowerCase();
        return (audits || []).filter(
            (a) =>
                a.actor?.toLowerCase().includes(q) ||
                a.note?.toLowerCase().includes(q) ||
                a.record?.toLowerCase().includes(q) ||
                a.table?.toLowerCase().includes(q)
        );
    }, [audits, search]);

    const paging = usePagination(tab === 'transaksi' ? filtered : filteredAudits);

    const activeCount = (logs || []).filter((l) => !l.done).length;

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat" />

            <div className="space-y-6">
                <PageHeader
                    title="Riwayat"
                    description="Jejak peminjaman dan siapa mengubah data"
                    icon={ScrollText}
                />

                <div className="flex gap-1 self-start rounded-lg border bg-card p-1">
                    {[
                        ['transaksi', 'Transaksi'],
                        ['audit', 'Perubahan data'],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => {
                                setTab(value);
                                setSearch('');
                            }}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                tab === value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'transaksi' ? (
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Riwayat transaksi</CardTitle>
                                <CardDescription>
                                    {activeCount} dari {logs?.length || 0} masih dipinjam
                                    {search ? ` • hasil untuk "${search}"` : ''}
                                </CardDescription>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                <div className="flex gap-1 rounded-lg border p-1">
                                    {[
                                        ['semua', 'Semua'],
                                        ['aktif', 'Dipinjam'],
                                        ['selesai', 'Kembali'],
                                    ].map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFilter(value)}
                                            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                                filter === value
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari buku atau anggota..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filtered.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Buku</TableHead>
                                                <TableHead>Anggota</TableHead>
                                                <TableHead>Tgl pinjam</TableHead>
                                                <TableHead>Tgl kembali</TableHead>
                                                <TableHead className="text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paging.paged.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.book}</TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {log.member}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {log.borrow_date}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {log.return_date || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end">
                                                            {log.done ? (
                                                                <Badge variant="outline">Kembali</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Dipinjam</Badge>
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
                                    icon={ScrollText}
                                    title={search ? 'Tidak ada hasil' : 'Belum ada aktivitas'}
                                    description={
                                        search
                                            ? `Tidak ditemukan catatan untuk "${search}".`
                                            : 'Catatan muncul otomatis setiap ada peminjaman.'
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Perubahan data</CardTitle>
                                <CardDescription>
                                    Siapa menambah, mengubah, atau menghapus data buku dan anggota
                                    {search ? ` • hasil untuk "${search}"` : ''}
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari pelaku, data, atau ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredAudits.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>Pelaku</TableHead>
                                                <TableHead>Aksi</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paging.paged.map((a) => (
                                                <TableRow key={a.id}>
                                                    <TableCell className="whitespace-nowrap text-muted-foreground">
                                                        {a.at}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{a.actor}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={ACTION_VARIANT[a.action] || 'outline'}>
                                                            {ACTION_LABEL[a.action] || a.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {a.table}
                                                        {a.record ? (
                                                            <span className="font-mono text-xs"> • {a.record}</span>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="max-w-64 truncate text-muted-foreground">
                                                        {a.note || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Pagination pagination={paging} />
                                </>
                            ) : (
                                <EmptyState
                                    icon={History}
                                    title={search ? 'Tidak ada hasil' : 'Belum ada perubahan'}
                                    description={
                                        search
                                            ? `Tidak ditemukan catatan untuk "${search}".`
                                            : 'Setiap tambah/ubah/hapus data tercatat di sini.'
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
