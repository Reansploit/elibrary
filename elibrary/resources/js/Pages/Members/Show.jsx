import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import PhotoThumb from '@/components/photo-thumb';
import { useCan } from '@/hooks/useCan';

function InfoRow({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-medium">{children}</span>
        </div>
    );
}

function LoanTable({ rows, emptyTitle, emptyDesc, showReturn }) {
    if (!rows?.length) {
        return <EmptyState icon={Users} title={emptyTitle} description={emptyDesc} />;
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Buku</TableHead>
                    <TableHead>Tgl pinjam</TableHead>
                    <TableHead>{showReturn ? 'Tgl kembali' : 'Jatuh tempo'}</TableHead>
                    {showReturn && <TableHead>Status</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((r) => (
                    <TableRow key={r.id}>
                        <TableCell className="max-w-48 truncate font-medium">{r.book}</TableCell>
                        <TableCell className="text-muted-foreground">{r.borrow_date}</TableCell>
                        <TableCell className="text-muted-foreground">
                            {showReturn ? r.return_date : (r.due ?? '-')}
                        </TableCell>
                        {showReturn && (
                            <TableCell>
                                <Badge variant={r.status === 'PIN' ? 'secondary' : 'outline'}>
                                    {r.status === 'PIN' ? 'Dipinjam' : 'Kembali'}
                                </Badge>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function MemberShow({ member, loans, history }) {
    const can = useCan();

    return (
        <AuthenticatedLayout>
            <Head title={member.name} />

            <div className="space-y-6">
                <PageHeader
                    title={member.name}
                    description="Detail anggota"
                    icon={Users}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={route('members.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {can(['edit_members', 'manage_members']) && (
                                <Button asChild>
                                    <Link href={route('members.edit', member.id)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                            <PhotoThumb
                                src={member.photo}
                                alt={member.name}
                                icon={Users}
                                className="h-48 w-48 rounded-xl"
                            />
                            <div>
                                <p className="font-semibold">{member.name}</p>
                            </div>
                            {member.sanctioned ? (
                                <Badge variant="destructive">
                                    Dibatasi
                                    {member.sanction_until ? ` s/d ${member.sanction_until}` : ''}
                                </Badge>
                            ) : (
                                <Badge variant="outline">Tanpa pembatasan</Badge>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <InfoRow label="Nama">{member.name}</InfoRow>
                            <InfoRow label="Jenis kelamin">{member.gender}</InfoRow>
                            <InfoRow label="Kelas">{member.class || '-'}</InfoRow>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pinjaman aktif</CardTitle>
                        <CardDescription>
                            {loans?.length || 0} buku belum dikembalikan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoanTable
                            rows={loans}
                            emptyTitle="Tidak ada pinjaman aktif"
                            emptyDesc="Semua buku sudah dikembalikan."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat peminjaman</CardTitle>
                        <CardDescription>10 transaksi terakhir anggota ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoanTable
                            rows={history}
                            showReturn
                            emptyTitle="Belum ada riwayat"
                            emptyDesc="Anggota ini belum pernah meminjam."
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
