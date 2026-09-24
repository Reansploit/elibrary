import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import KatalogHeader from '@/components/katalog-header';
import KatalogBookCard from '@/components/katalog-book-card';
import EmptyState from '@/components/empty-state';

export default function KatalogAll({ books, categories = [], activeCategory = '', q = '' }) {
    const { props } = usePage();
    const libraryName = props.libraryName || 'Perpustakaan WBS';
    const [query, setQuery] = useState(q);

    const { data = [], current_page = 1, last_page = 1, total = 0 } = books || {};

    const goTo = (page) => {
        if (page < 1 || page > last_page || page === current_page) return;
        router.get(
            route('katalog.all'),
            { page, kategori: activeCategory || undefined, q: q || undefined },
            { preserveState: true }
        );
    };

    const pickCategory = (id) => {
        router.get(route('katalog.all'), { kategori: id || undefined });
    };

    const pages = (() => {
        if (last_page <= 7) return Array.from({ length: last_page }, (_, i) => i + 1);
        const window = [current_page - 1, current_page, current_page + 1].filter(
            (p) => p > 1 && p < last_page
        );
        const list = [...new Set([1, ...window, last_page])].sort((a, b) => a - b);
        const result = [];
        let prev = 0;
        for (const p of list) {
            if (p - prev > 1) result.push('…');
            result.push(p);
            prev = p;
        }
        return result;
    })();

    return (
        <div className="min-h-screen bg-background">
            <Head title="Semua Buku" />
            <KatalogHeader libraryName={libraryName} showBack />

            <main className="mx-auto w-full max-w-4xl space-y-4 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Semua buku</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {total} koleksi terdaftar
                    </p>
                </div>

                <form
                    className="relative"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(route('katalog.all'), {
                            q: query.trim() || undefined,
                            kategori: activeCategory || undefined,
                        });
                    }}
                >
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari judul, pengarang, atau ID…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-11 bg-card pl-10"
                    />
                </form>

                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => pickCategory('')}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                !activeCategory
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'bg-card hover:bg-muted'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => pickCategory(cat.id)}
                                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                    activeCategory === cat.id
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'bg-card hover:bg-muted'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {data.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.map((book) => (
                                <KatalogBookCard key={book.id} book={book} />
                            ))}
                        </div>

                        {last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                <p className="text-xs text-muted-foreground">
                                    Halaman {current_page} dari {last_page} • {total} buku
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        disabled={current_page <= 1}
                                        onClick={() => goTo(current_page - 1)}
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {pages.map((p, i) =>
                                        p === '…' ? (
                                            <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                                                …
                                            </span>
                                        ) : (
                                            <Button
                                                key={p}
                                                type="button"
                                                variant={p === current_page ? 'default' : 'outline'}
                                                size="icon-sm"
                                                className="min-w-7"
                                                onClick={() => goTo(p)}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        disabled={current_page >= last_page}
                                        onClick={() => goTo(current_page + 1)}
                                        aria-label="Halaman berikutnya"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title="Belum ada buku"
                        description="Koleksi akan tampil di sini setelah ditambahkan petugas."
                    />
                )}
            </main>
        </div>
    );
}
