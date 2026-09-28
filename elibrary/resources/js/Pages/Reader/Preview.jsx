import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Info, Minus, Moon, Plus, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { readerDemoDocument } from '@/lib/reader-demo';
import { mountDocumentReader } from '@reo-engine/renderer-web';

const MIN_SCALE = 0.9;
const MAX_SCALE = 1.3;
const SCALE_STEP = 0.1;

function clampScale(value) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(1))));
}

export default function ReaderPreview({ book }) {
    const { theme, toggleTheme } = useTheme();
    const readerRef = useRef(null);
    const readerInstanceRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!readerRef.current) return undefined;

        try {
            readerInstanceRef.current = mountDocumentReader(readerRef.current, readerDemoDocument, { theme });
            setStatus('ready');
        } catch {
            setStatus('error');
        }

        return () => {
            readerInstanceRef.current?.destroy();
            readerInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        readerInstanceRef.current?.update(readerDemoDocument, { theme });
    }, [theme]);

    const changeScale = (amount) => {
        setScale((current) => clampScale(current + amount));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Preview reader - ${book.title}`} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:p-6">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Preview reader</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{book.title}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Contoh tampilan engine. File PDF belum disambungkan ke halaman ini.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('books.show', book.id)}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke detail
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11"
                            onClick={toggleTheme}
                            aria-label={theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
                            title={theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div className="flex min-w-0 items-start gap-2 text-sm text-muted-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <p>Area baca ini memakai IR v0.1. Coba ubah ukuran layar untuk melihat reflow.</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2" role="group" aria-label="Ukuran teks">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => changeScale(-SCALE_STEP)}
                            disabled={scale <= MIN_SCALE}
                            aria-label="Kecilkan teks"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-14 text-center text-sm tabular-nums" aria-live="polite">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => changeScale(SCALE_STEP)}
                            disabled={scale >= MAX_SCALE}
                            aria-label="Perbesar teks"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <section className="reader-surface overflow-hidden rounded-xl border bg-card" aria-label="Area baca">
                    {status === 'loading' && (
                        <div className="flex min-h-96 items-center justify-center p-8 text-sm text-muted-foreground" role="status">
                            Menyiapkan preview...
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex min-h-96 flex-col items-center justify-center gap-3 p-8 text-center" role="alert">
                            <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                            <div>
                                <p className="font-medium">Preview belum dapat ditampilkan</p>
                                <p className="mt-1 text-sm text-muted-foreground">Muat ulang halaman untuk mencoba lagi.</p>
                            </div>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Muat ulang
                            </Button>
                        </div>
                    )}
                    <div
                        ref={readerRef}
                        className={status === 'ready' ? 'block' : 'hidden'}
                        style={{ '--reader-scale': scale }}
                    />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
