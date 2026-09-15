import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, BookOpen, Users, User } from 'lucide-react';
import { Swirling } from '@/components/ui/loading';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PhotoThumb from '@/components/photo-thumb';

function SectionTitle({ icon: Icon, children }) {
    return (
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            {children}
        </p>
    );
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 1) {
            setResults(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            fetch(route('search.index', { q }), {
                signal: controller.signal,
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    setResults(data);
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.name !== 'AbortError') setLoading(false);
                });
        }, 350);

        return () => {
            clearTimeout(timer);
            abortRef.current?.abort();
        };
    }, [query]);

    const showResults = query.trim().length >= 1;
    const total =
        (results?.books?.length || 0) +
        (results?.members?.length || 0) +
        (results?.users?.length || 0);

    return (
        <div className="space-y-3">
            <form
                className="relative"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (query.trim()) router.get(route('search.index'), { q: query.trim() });
                }}
            >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cari buku, anggota, atau pengguna… (Enter = semua hasil)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-11 bg-card pl-10"
                />
                {loading && (
                    <Swirling className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
            </form>

            {showResults && (
                <Card>
                    <CardContent className="space-y-5 pt-6">
                        {!results && loading && (
                            <p className="text-sm text-muted-foreground">Mencari…</p>
                        )}
                        {results && total === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Tidak ditemukan hasil untuk “{query.trim()}”.
                            </p>
                        )}
                        {results && results.books?.length > 0 && (
                            <div className="space-y-2">
                                <SectionTitle icon={BookOpen}>
                                    Buku ({results.books.length})
                                </SectionTitle>
                                <div className="divide-y rounded-lg border">
                                    {results.books.map((book) => (
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
                                                    {` • Stok ${book.stock ?? 0}`}
                                                    {book.location ? ` • ${book.location}` : ''}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {book.borrowed ? (
                                                        <Badge variant="secondary">
                                                            {book.remaining > 0
                                                                ? `Belum kembali • sisa ${book.remaining}`
                                                                : 'Belum kembali semua'}
                                                            {book.borrower ? ` • ${book.borrower}` : ''}
                                                            {book.due ? ` • jatuh tempo ${book.due}` : ''}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Tersedia</Badge>
                                                    )}
                                                    {book.reserved > 0 && (
                                                        <Badge variant="outline">
                                                            Direservasi {book.reserved}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {results && results.members?.length > 0 && (
                            <div className="space-y-2">
                                <SectionTitle icon={Users}>
                                    Anggota ({results.members.length})
                                </SectionTitle>
                                <div className="divide-y rounded-lg border">
                                    {results.members.map((member) => (
                                        <Link
                                            key={member.id}
                                            href={route('members.show', member.id)}
                                            className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <PhotoThumb src={member.photo} alt={member.name} icon={Users} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{member.name}</p>
                                                {member.class && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {member.class}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {member.sanctioned && (
                                                        <Badge variant="destructive">Dibatasi</Badge>
                                                    )}
                                                    {member.loans?.length > 0 ? (
                                                        member.loans.map((loan, i) => (
                                                            <Badge key={i} variant="secondary">
                                                                {loan.book}
                                                                {loan.due ? ` • kembali ${loan.due}` : ' • belum kembali'}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <Badge variant="outline">Tidak ada pinjaman aktif</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {results && results.users?.length > 0 && (
                            <div className="space-y-2">
                                <SectionTitle icon={User}>
                                    Pengguna ({results.users.length})
                                </SectionTitle>
                                <div className="divide-y rounded-lg border">
                                    {results.users.map((user) => (
                                        <div key={user.id} className="flex items-center gap-3 p-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                                                {(user.name?.[0] || 'U').toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{user.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    @{user.username}
                                                </p>
                                                <div className="mt-1">
                                                    <Badge variant="secondary">{user.role}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
