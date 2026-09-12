import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KatalogHeader from '@/components/katalog-header';
import KatalogBookCard from '@/components/katalog-book-card';
import EmptyState from '@/components/empty-state';

export default function KatalogAll({ books }) {
    const { props } = usePage();
    const libraryName = props.libraryName || 'E-Library';

    const { data = [], current_page = 1, last_page = 1, total = 0 } = books || {};

    const goTo = (page) => {
        if (page < 1 || page > last_page || page === current_page) return;
        router.get(route('katalog.all'), { page }, { preserveState: true });
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
