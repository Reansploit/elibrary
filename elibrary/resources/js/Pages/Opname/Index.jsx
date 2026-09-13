import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { ClipboardCheck, Search, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import ConfirmDialog from '@/components/confirm-dialog';

const STATUS_VARIANT = {
    tersedia: 'outline',
    hilang: 'destructive',
    rusak: 'destructive',
};

export default function OpnameIndex({ items, locations, filters, borrowedCount }) {
    const [lokasi, setLokasi] = useState(filters?.lokasi || '');
    const [q, setQ] = useState(filters?.q || '');
    const [checked, setChecked] = useState([]);
    const [code, setCode] = useState('');
    const [codeMsg, setCodeMsg] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const codeRef = useRef(null);

    const rows = items || [];
    const expected = useMemo(() => rows.map((r) => r.id), [rows]);
    const newLost = useMemo(
        () => rows.filter((r) => r.status === 'tersedia' && !checked.includes(r.id)).length,
        [rows, checked]
    );
    const rediscovered = useMemo(
        () => rows.filter((r) => r.status === 'hilang' && checked.includes(r.id)).length,
        [rows, checked]
    );

    const applyFilter = () => {
        router.get(route('opname.index'), { lokasi, q }, { preserveState: true });
    };

    const toggle = (id) => {
        setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    // Ketik/scan kode eksemplar lalu Enter = centang ketemu.
    const handleCodeEnter = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const query = code.trim().toLowerCase();
        if (!query) return;
        const hit = rows.find((r) => r.code.toLowerCase() === query);
        if (hit) {
            setChecked((prev) => (prev.includes(hit.id) ? prev : [...prev, hit.id]));
            setCodeMsg(`${hit.code} dicentang.`);
            setCode('');
        } else {
            setCodeMsg(`Kode ${code.trim()} tidak ada di daftar ini.`);
        }
        codeRef.current?.focus();
    };

    const submit = () => {
        setSaving(true);
        router.post(route('opname.finish'), { expected, found: checked }, {
            onFinish: () => {
                setSaving(false);
                setChecked([]);
                setConfirmOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Opname" />

            <div className="space-y-6">
                <PageHeader
                    title="Opname"
                    description="Cek fisik buku di rak — centang yang ketemu, sisanya jadi hilang"
                    icon={ClipboardCheck}
                    actions={
                        <Button
                            disabled={!rows.length || saving}
                            onClick={() => setConfirmOpen(true)}
                        >
                            <ClipboardCheck className="h-4 w-4" />
                            Selesaikan opname
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>1. Tentukan lingkup</CardTitle>
                        <CardDescription>
                            {borrowedCount || 0} eksemplar sedang dipinjam (tidak ikut opname) •{' '}
                            {checked.length} dari {rows.length} dicentang ketemu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="space-y-1">
                            <Label htmlFor="lokasi">Rak</Label>
                            <select
                                id="lokasi"
                                value={lokasi}
                                onChange={(e) => setLokasi(e.target.value)}
                                className="h-9 w-full rounded-lg border bg-card px-3 text-sm sm:w-52"
                            >
                                <option value="">Semua rak</option>
                                {(locations || []).map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="q">Judul / kode</Label>
                            <Input
                                id="q"
                                placeholder="mis. Laskar atau BK-001"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                                className="sm:w-64"
                            />
                        </div>
                        <Button variant="outline" onClick={applyFilter}>
                            <Search className="h-4 w-4" />
                            Tampilkan
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Centang yang ketemu</CardTitle>
                        <CardDescription>
                            Ketik/scan kode lalu Enter, atau centang manual satu per satu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={codeRef}
                                placeholder="Scan atau ketik kode eksemplar lalu Enter…"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onKeyDown={handleCodeEnter}
                                className="pl-9 font-mono"
                            />
                            {codeMsg && <p className="mt-1 text-xs text-muted-foreground">{codeMsg}</p>}
                        </div>

                        {rows.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <span className="sr-only">Ketemu</span>
                                        </TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Buku</TableHead>
                                        <TableHead>Status awal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-primary"
                                                    checked={checked.includes(r.id)}
                                                    onChange={() => toggle(r.id)}
                                                    aria-label={r.code}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-medium">
                                                {r.code}
                                            </TableCell>
                                            <TableCell className="max-w-52 truncate">
                                                {r.book}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={STATUS_VARIANT[r.status] || 'outline'}>
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState
                                icon={ClipboardCheck}
                                title="Tidak ada data"
                                description="Pilih rak atau kata kunci lain di lingkup atas."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Selesaikan opname"
                description={
                    <>
                        {rediscovered} eksemplar hilang dinyatakan ketemu lagi,{' '}
                        {newLost} eksemplar tersedia dinyatakan hilang. Lanjutkan?
                    </>
                }
                confirmLabel="Simpan hasil"
                processing={saving}
                onConfirm={submit}
            />
        </AuthenticatedLayout>
    );
}
