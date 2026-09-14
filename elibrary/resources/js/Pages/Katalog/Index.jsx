import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhotoThumb from '@/components/photo-thumb';
import { Swirling } from '@/components/ui/loading';
import KatalogHeader from '@/components/katalog-header';
import KatalogBookCard, { AvailabilityBadge } from '@/components/katalog-book-card';

export default function KatalogIndex({ featured = [], total = 0, categories = [] }) {
    const { props } = usePage();
    const libraryName = props.libraryName || 'E-Library';
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState(null);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 1) {
            setBooks(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            fetch(route('katalog.search', { q }), {
                signal: controller.signal,
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    setBooks(data?.books || []);
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

    return (
        <div className="min-h-screen bg-background">
            <Head title="Katalog" />
            <KatalogHeader libraryName={libraryName} />

            <main className="mx-auto w-full max-w-4xl space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Cari buku</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Cek ketersediaan koleksi tanpa perlu login
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Ketik judul, pengarang, atau ID buku…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-11 bg-card pl-10"
                        autoFocus
                    />
                    {loading && (
                        <Swirling className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                </div>

                {categories.length > 0 && !showResults && (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={route('katalog.all', { kategori: cat.id })}
                                className="rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {showResults ? (                    <Card>
                        <CardContent className="pt-6">
                            {!books && loading && (
                                <p className="text-sm text-muted-foreground">Mencari…</p>
                            )}
                            {books && books.length === 0 && (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium">Tidak ditemukan</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Coba kata kunci lain atau tanya petugas.
                                    </p>
                                </div>
                            )}
                            {books && books.length > 0 && (
                                <div className="divide-y rounded-lg border">
                                    {books.map((book) => (
                                        <div key={book.id} className="flex items-center gap-3 p-3">
                                            <PhotoThumb src={book.photo} alt={book.title} icon={BookOpen} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{book.title}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    <span className="font-mono">{book.id}</span>
                                                    {book.author ? ` • ${book.author}` : ''}
                                                </p>
                                                <div className="mt-1">
                                                    <AvailabilityBadge book={book} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    featured.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold tracking-tight">Koleksi terbaru</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {featured.map((book) => (
                                    <KatalogBookCard key={book.id} book={book} />
                                ))}
                            </div>
                            {total > featured.length && (
                                <div className="flex justify-center pt-2">
                                    <Button variant="outline" asChild>
                                        <Link href={route('katalog.all')}>
                                            Lihat selengkapnya ({total - featured.length} lainnya)
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
