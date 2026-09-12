import { useMemo, useState } from 'react';
import { Search, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Pilihan berbasis pencarian (pengganti dropdown scroll).
 * Ketik untuk menyaring, klik untuk memilih.
 */
export default function SearchSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Ketik untuk mencari…',
    emptyText = 'Tidak ada hasil.',
    onEnter,
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(
            (o) =>
                o.label?.toLowerCase().includes(q) || o.value?.toLowerCase().includes(q)
        );
    }, [options, query]);

    const selected = options.find((o) => o.value === value);
    const hasQuery = query.trim().length > 0;

    return (
        <div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && onEnter) {
                            e.preventDefault();
                            onEnter(query);
                        }
                    }}
                    className="pl-9 pr-9"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Bersihkan pencarian"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {selected && (
                <p className="mt-2 truncate text-xs text-muted-foreground">
                    Terpilih: <span className="font-medium text-foreground">{selected.label}</span>
                </p>
            )}

            {hasQuery && (
                <>
                    <div className="mt-2 max-h-48 divide-y overflow-y-auto rounded-lg border">
                {filtered.length > 0 ? (
                    filtered.map((option) => {
                        const active = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange(option.value)}
                                className={cn(
                                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                                    active ? 'bg-primary/10 font-medium' : 'hover:bg-muted/60'
                                )}
                            >
                                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                            </button>
                        );
                    })
                ) : (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
                )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {filtered.length} dari {options.length} pilihan
                    </p>
                </>
            )}
        </div>
    );
}
