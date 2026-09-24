import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/page-header';
import SearchSelect from '@/components/search-select';
import { Swirling } from '@/components/ui/loading';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

function toDisplay(iso) {
    if (!iso) return '';
    const parts = String(iso).split('-');
    if (parts.length !== 3) return String(iso);
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
}

function toISO(display) {
    const m = String(display).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function maskDate(digits) {
    const d = digits.slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// Input tanggal tampil dd/mm/yyyy, nilai ke server yyyy-mm-dd.
function DateTextInput({ id, value, onChange, ...props }) {
    const [text, setText] = useState(toDisplay(value));
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        setText(toDisplay(value));
        setInvalid(false);
    }, [value]);

    return (
        <>
            <Input
                id={id}
                inputMode="numeric"
                placeholder="hh/bb/tttt"
                value={text}
                onChange={(e) => {
                    const masked = maskDate(e.target.value.replace(/\D/g, ''));
                    setText(masked);
                    if (masked.length === 10) {
                        const iso = toISO(masked);
                        setInvalid(!iso);
                        if (iso) onChange(iso);
                    } else {
                        setInvalid(false);
                    }
                }}
                {...props}
            />
            {invalid && <p className="text-xs text-destructive">Tanggal tidak valid (hh/bb/tttt).</p>}
        </>
    );
}

function addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function Borrow({ books, members, loan_duration = 7 }) {
    const today = new Date().toISOString().split('T')[0];
    const { data, setData, post, errors, processing } = useForm({
        id_buku: '',
        id_anggota: '',
        tgl_pinjam: today,
        jam_pinjam: new Date().toTimeString().slice(0, 5),
        tgl_kembali: addDays(today, Number(loan_duration) || 7),
    });
    const formRef = useRef(null);
    const [autoSave, setAutoSave] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('circulation.store'));
    };

    // Alur scanner RFID: ketik/scan → Enter → cocok persis → simpan otomatis.
    useEffect(() => {
        if (autoSave) {
            setAutoSave(false);
            formRef.current?.requestSubmit();
        }
    }, [autoSave, data.id_anggota]);

    const handleBookEnter = (q) => {
        const query = q.trim().toLowerCase();
        const exact = (books || []).find((b) => b.id.toLowerCase() === query);
        if (exact) setData('id_buku', exact.id);
    };

    const handleMemberEnter = (q) => {
        const query = q.trim().toLowerCase();
        const exact = (members || []).find((m) => m.id.toLowerCase() === query);
        if (exact) {
            setData('id_anggota', exact.id);
            setAutoSave(true);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pinjam Buku" />

            <div className="mx-auto w-full max-w-2xl space-y-6">
                <PageHeader
                    title="Pinjam buku"
                    description="Catat peminjaman buku oleh anggota"
                    icon={ArrowLeftRight}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('circulation.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form ref={formRef} onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data peminjaman</CardTitle>
                            <CardDescription>Pilih buku dan anggota</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    Buku <span className="text-destructive">*</span>
                                </Label>
                                <SearchSelect
                                    value={data.id_buku}
                                    onChange={(val) => setData('id_buku', val)}
                                    onEnter={handleBookEnter}
                                    options={(books || []).map((book) => ({
                                        value: book.id,
                                        label: `${book.id} - ${book.title}${book.location ? ` • ${book.location}` : ''} • tersedia ${book.available ?? 0}`,
                                    }))}
                                    placeholder="Ketik judul atau ID buku…"
                                    emptyText="Buku tidak ditemukan."
                                />
                                <FieldError message={errors.id_buku} />
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Anggota <span className="text-destructive">*</span>
                                </Label>
                                <SearchSelect
                                    value={data.id_anggota}
                                    onChange={(val) => setData('id_anggota', val)}
                                    onEnter={handleMemberEnter}
                                    options={(members || []).map((member) => ({
                                        value: member.id,
                                        label: `${member.id} - ${member.name}${member.sanctioned ? ' (dibatasi)' : ''}`,
                                    }))}
                                    placeholder="Ketik nama atau RFID anggota…"
                                    emptyText="Anggota tidak ditemukan."
                                />
                                <FieldError message={errors.id_anggota} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tgl_kembali">
                                    Harus dikembalikan pada <span className="text-destructive">*</span>
                                </Label>
                                <DateTextInput
                                    id="tgl_kembali"
                                    value={data.tgl_kembali}
                                    onChange={(iso) => setData('tgl_kembali', iso)}
                                    aria-invalid={!!errors.tgl_kembali || undefined}
                                />
                                <FieldError message={errors.tgl_kembali} />
                                <p className="text-xs text-muted-foreground">
                                    Otomatis {loan_duration} hari dari tanggal pinjam, bisa diubah.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tgl_pinjam">Tanggal pinjam</Label>
                                    <DateTextInput
                                        id="tgl_pinjam"
                                        value={data.tgl_pinjam}
                                        onChange={(iso) => {
                                            setData({
                                                ...data,
                                                tgl_pinjam: iso,
                                                tgl_kembali: addDays(iso, Number(loan_duration) || 7),
                                            });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jam_pinjam">Jam pinjam</Label>
                                    <Input
                                        id="jam_pinjam"
                                        type="time"
                                        value={data.jam_pinjam}
                                        onChange={(e) => setData('jam_pinjam', e.target.value)}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Boleh diisi mundur bila baru sempat mencatat (tanggal kembali ikut menyesuaikan).
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route('circulation.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <Swirling className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
