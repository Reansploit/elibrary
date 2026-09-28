import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BookOpen, ThumbsUp, Users, NotebookPen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import StatCard from '@/components/stat-card';

function RankTable({ columns, rows, empty }) {
    if (!rows || rows.length === 0) {
        return <EmptyState title="Belum ada data" description={empty} />;
    }
    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        {columns.map((c) => (
                            <TableHead key={c}>{c}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                            {Object.values(r).map((v, j) => (
                                <TableCell key={j}>{v}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function StatistikIndex({ read, liked, readers, totals }) {
    return (
        <AuthenticatedLayout>
            <Head title="Statistik Baca" />
            <div className="space-y-6">
                <PageHeader
                    title="Statistik Baca"
                    description="Bacaan digital santri dari portal viewer"
                    icon={BookOpen}
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Buku dibuka" value={totals.buka} icon={BookOpen} />
                    <StatCard label="Santri membaca" value={totals.pembaca} icon={Users} />
                    <StatCard label="Suara jempol" value={totals.suara} icon={ThumbsUp} />
                    <StatCard label="Catatan" value={totals.catatan} icon={NotebookPen} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Paling sering dibuka</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RankTable
                            columns={['ID', 'Judul', 'Dibuka']}
                            rows={read}
                            empty="Belum ada yang membuka buku."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Paling disuka</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RankTable
                            columns={['ID', 'Judul', 'Suka', 'Tidak suka']}
                            rows={liked}
                            empty="Belum ada suara masuk."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pembaca paling aktif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RankTable
                            columns={['ID', 'Nama', 'Kelas', 'Buka']}
                            rows={readers}
                            empty="Belum ada aktivitas baca."
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
