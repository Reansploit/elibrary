import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, BookOpen, Users, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import PhotoThumb from '@/components/photo-thumb';
import { useCan } from '@/hooks/useCan';

export default function SearchIndex({ q = '', results }) {
    const can = useCan();
    const [query, setQuery] = useState(q);

    const books = results?.books || [];
    const members = results?.members || [];
    const users = results?.users || [];
    const total = books.length + members.length + users.length;

    const submit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.get(route('search.index'), { q: query.trim() });
    };

    return (
        <AuthenticatedLayout>
            <Head title={q ? `Cari: ${q}` : 'Pencarian'} />

            <div className="space-y-6">
                <PageHeader
                    title="Hasil pencarian"
                    description={
                        q ? `${total} hasil untuk “${q}”` : 'Ketik kata kunci untuk mencari'
                    }
                    icon={Search}
                />

                <form onSubmit={submit} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari buku, anggota, atau pengguna…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-11 bg-card pl-10"
                    />
                </form>

                {q && total === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                        <video
                            src="/animasi/404.webm"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-48 w-48 object-contain"
                            aria-label="Tidak ditemukan"
                        />
                        <p className="mt-2 text-sm font-medium">Tidak ditemukan</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tidak ada hasil untuk “{q}”. Coba kata kunci lain.
                        </p>
                    </div>
                )}

                {books.length > 0 && (
                    <Card>
                        <CardContent className="space-y-2 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Buku ({books.length})
                            </p>
                            <div className="divide-y rounded-lg border">
                                {books.map((book) => (
                                    <Link
                                        key={book.id}
                                        href={route('books.show', book.id)}
                                        className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <PhotoThumb src={book.photo} alt={book.title} icon={BookOpen} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{book.title}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                <span className="font-mono">{book.id}</span>
                                                {book.author ? ` • ${book.author}` : ''}
                                                {book.location ? ` • ${book.location}` : ''}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {members.length > 0 && (
                    <Card>
                        <CardContent className="space-y-2 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Anggota ({members.length})
                            </p>
                            <div className="divide-y rounded-lg border">
                                {members.map((member) => (
                                    <Link
                                        key={member.id}
                                        href={route('members.show', member.id)}
                                        className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <PhotoThumb src={member.photo} alt={member.name} icon={Users} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{member.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {member.class || 'Tanpa kelas'}
                                                {member.loans?.length > 0 &&
                                                    ` • pinjam ${member.loans.length}`}
                                            </p>
                                        </div>
                                        {member.sanctioned && <Badge variant="destructive">Dibatasi</Badge>}
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {users.length > 0 && can(['manage_users']) && (
                    <Card>
                        <CardContent className="space-y-2 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Pengguna ({users.length})
                            </p>
                            <div className="divide-y rounded-lg border">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-3 p-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                @{user.username} • {user.role}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
