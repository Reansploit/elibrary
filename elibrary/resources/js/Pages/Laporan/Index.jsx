import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import StatCard from '@/components/stat-card';

const TYPES = [
    ['sirkulasi', 'Sirkulasi'],
    ['koleksi', 'Koleksi'],
    ['anggota', 'Anggota'],
];

export default function LaporanIndex({ filters, columns, rows, summary, generatedAt }) {
    const [type, setType] = useState(filters?.type || 'sirkulasi');
    const [dari, setDari] = useState(filters?.dari || '');
    const [sampai, setSampai] = useState(filters?.sampai || '');

    const apply = (nextType) => {
        router.get(route('laporan.index'), {
            type: nextType ?? type,
            dari,
            sampai,
        });
    };

    const exportUrl =
        route('laporan.export') +
        `?type=${type}&dari=${dari}&sampai=${sampai}`;

    return (
        <AuthenticatedLayout>
            <Head title="Laporan" />
            <style>{`@media print { aside, header { display: none !important; } }`}</style>

            <div className="space-y-6">
                <div className="print:hidden">
                    <PageHeader
                        title="Laporan"
                        description="Rekap untuk arsip pondok — tampilkan, cetak, atau unduh CSV"
                        icon={FileText}
                        actions={
                            <>
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="h-4 w-4" />
                                    Cetak
                                </Button>
                                <Button variant="outline" asChild>
                                    <a href={exportUrl}>
                                        <Download className="h-4 w-4" />
                                        Unduh CSV
                                    </a>
                                </Button>
                            </>
                        }
                    />
                </div>

                <Card className="print:hidden">
                    <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end">
                        <div className="flex gap-1 self-start rounded-lg border p-1">
                            {TYPES.map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setType(value);
                                        apply(value);
                                    }}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                        type === value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {type === 'sirkulasi' && (
                            <>
                                <div className="space-y-1">
                                    <Label htmlFor="dari">Dari</Label>
                                    <Input
                                        id="dari"
                                        type="date"
                                        value={dari}
                                        onChange={(e) => setDari(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="sampai">Sampai</Label>
                                    <Input
                                        id="sampai"
                                        type="date"
                                        value={sampai}
                                        onChange={(e) => setSampai(e.target.value)}
                                    />
                                </div>
                                <Button onClick={() => apply()}>Tampilkan</Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3">
                    {(summary || []).map((s) => (
                        <StatCard key={s.label} label={s.label} value={s.value} icon={FileText} />
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Laporan {TYPES.find(([v]) => v === type)?.[1]}
                            {type === 'sirkulasi' && filters?.dari && filters?.sampai
                                ? ` • ${filters.dari} s/d ${filters.sampai}`
                                : ''}
                        </CardTitle>
                        <CardDescription>Dibuat {generatedAt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {rows?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {(columns || []).map((c) => (
                                            <TableHead key={c}>{c}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, i) => (
                                        <TableRow key={i}>
                                            {(columns || []).map((c) => (
                                                <TableCell
                                                    key={c}
                                                    className={c === 'ID' || c === 'RFID' ? 'font-mono text-xs' : ''}
                                                >
                                                    {row[c]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState
                                icon={FileText}
                                title="Tidak ada data"
                                description="Ubah jenis laporan atau rentang tanggalnya."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
