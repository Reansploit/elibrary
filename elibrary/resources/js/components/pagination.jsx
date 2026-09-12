import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function pageNumbers(page, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const window = [page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages);
    const pages = [1, ...window, totalPages];
    const result = [];
    let prev = 0;
    for (const p of [...new Set(pages)].sort((a, b) => a - b)) {
        if (p - prev > 1) result.push('…');
        result.push(p);
        prev = p;
    }
    return result;
}

export default function Pagination({ pagination }) {
    const { page, totalPages, setPage, total, perPage } = pagination;

    if (totalPages <= 1) return null;

    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    return (
        <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                Menampilkan {start}–{end} dari {total}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers(page, totalPages).map((p, i) =>
                    p === '…' ? (
                        <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                            …
                        </span>
                    ) : (
                        <Button
                            key={p}
                            type="button"
                            variant={p === page ? 'default' : 'outline'}
                            size="icon-sm"
                            className="min-w-7"
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </Button>
                    )
                )}
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
