import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { pdfPagesToDocumentIR } from '@reo-engine/parser-pdf';
import { mountDocumentReader } from '@reo-engine/renderer-web';
import { analyzePdfPageFromPdf } from '@/lib/pdf-analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MIN_SCALE = 0.6;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;
const TEXT_BATCH_SIZE = 4;

function formatSize(bytes) {
    if (!bytes) return '0 KB';
    return `${Math.ceil(bytes / 1024)} KB`;
}

export default function ReaderPdf({ book, file, assetBaseUrl }) {
    const { theme } = useTheme();
    const themeRef = useRef(theme);
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const engineInstanceRef = useRef(null);
    const engineDocumentRef = useRef(null);
    const [pdf, setPdf] = useState(null);
    const [mode, setMode] = useState('original');
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [engineStatus, setEngineStatus] = useState('idle');
    const [engineProgress, setEngineProgress] = useState(0);
    const [engineError, setEngineError] = useState('');

    const pdfjsAssets = {
        wasmUrl: `${assetBaseUrl}/wasm/`,
        cMapUrl: `${assetBaseUrl}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `${assetBaseUrl}/standard_fonts/`,
        iccUrl: `${assetBaseUrl}/iccs/`,
    };

    useEffect(() => {
        themeRef.current = theme;
        if (engineDocumentRef.current && engineInstanceRef.current) {
            engineInstanceRef.current.update(engineDocumentRef.current, { theme });
        }
    }, [theme]);

    useEffect(() => {
        let active = true;
        let loadingTask = null;

        setStatus('loading');
        fetch(file.url, { credentials: 'same-origin' })
            .then((response) => {
                if (!response.ok) throw new Error('File PDF tidak dapat diakses.');
                return response.arrayBuffer();
            })
            .then((data) => {
                loadingTask = pdfjsLib.getDocument({ data, isEvalSupported: false, ...pdfjsAssets });
                return loadingTask.promise;
            })
            .then((documentPdf) => {
                if (!active) return;
                setPdf(documentPdf);
                setStatus('ready');
            })
            .catch((error) => {
                if (!active) return;
                setErrorMessage(error.message || 'Gagal memuat PDF.');
                setStatus('error');
            });

        return () => {
            active = false;
            loadingTask?.destroy();
        };
    }, [file.url]);

    useEffect(() => {
        if (!pdf || !canvasRef.current) return undefined;

        let active = true;
        let renderTask = null;

        pdf.getPage(pageNumber)
            .then((page) => {
                if (!active || !canvasRef.current) return null;
                const viewport = page.getViewport({ scale });
                const outputScale = window.devicePixelRatio || 1;
                const canvas = canvasRef.current;
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas tidak tersedia.');
                renderTask = page.render({
                    canvas,
                    canvasContext: context,
                    viewport,
                    transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
                });
                return renderTask.promise;
            })
            .catch((error) => {
                if (active && error?.name !== 'RenderingCancelledException') {
                    setErrorMessage(error.message || 'Halaman gagal dirender.');
                    setStatus('error');
                }
            });

        return () => {
            active = false;
            renderTask?.cancel();
        };
    }, [pdf, pageNumber, scale]);

    useEffect(() => {
        let active = true;

        if (mode !== 'engine' || !pdf) {
            setEngineStatus('idle');
            setEngineProgress(0);
            engineInstanceRef.current?.destroy();
            engineInstanceRef.current = null;
            engineDocumentRef.current = null;
            engineRef.current?.replaceChildren();
            return undefined;
        }

        const extractPages = async () => {
            setEngineStatus('loading');
            setEngineProgress(0);
            setEngineError('');
            const pages = [];
            const total = pdf.numPages;

            for (let start = 1; start <= total; start += TEXT_BATCH_SIZE) {
                const numbers = Array.from(
                    { length: Math.min(TEXT_BATCH_SIZE, total - start + 1) },
                    (_, offset) => start + offset,
                );
                const batch = await Promise.all(numbers.map(async (number) => {
                    const analysis = await analyzePdfPageFromPdf(pdf, number);
                    return {
                        pageNumber: number,
                        text: analysis.textRegions.map((region) => region.text).join('\n'),
                    };
                }));
                pages.push(...batch);
                if (active) setEngineProgress(Math.round((pages.length / total) * 100));
            }

            const documentIR = pdfPagesToDocumentIR(
                { id: `book-${book.id}`, title: book.title, author: book.author },
                pages,
            );

            if (!active) return;
            if (documentIR.children.length === 0) {
                setEngineStatus('empty');
                return;
            }
            if (!engineRef.current) {
                setEngineStatus('error');
                setEngineError('Area engine tidak siap.');
                return;
            }

            engineDocumentRef.current = documentIR;
            engineInstanceRef.current = mountDocumentReader(engineRef.current, documentIR, {
                theme: themeRef.current,
            });
            setEngineStatus('ready');
        };

        extractPages().catch((error) => {
            if (!active) return;
            setEngineStatus('error');
            setEngineError(error.message || 'Ekstraksi teks PDF gagal.');
        });

        return () => {
            active = false;
            engineInstanceRef.current?.destroy();
            engineInstanceRef.current = null;
            engineDocumentRef.current = null;
        };
    }, [mode, pdf, book.id, book.title, book.author]);

    const changePage = (value) => {
        if (!pdf) return;
        setPageNumber(Math.min(pdf.numPages, Math.max(1, value)));
    };

    const changeScale = (amount) => {
        setScale((current) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((current + amount).toFixed(1)))));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Baca ${book.title}`} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:p-6">
                <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Baca ebook</p>
                        <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">{book.title}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {file.original_name} · {formatSize(file.size_bytes)}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('books.show', book.id)}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke detail
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="flex items-center gap-2" role="tablist" aria-label="Mode reader">
                        <Button
                            type="button"
                            size="sm"
                            variant={mode === 'original' ? 'default' : 'ghost'}
                            onClick={() => setMode('original')}
                            role="tab"
                            aria-selected={mode === 'original'}
                        >
                            Original
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={mode === 'engine' ? 'default' : 'ghost'}
                            onClick={() => setMode('engine')}
                            role="tab"
                            aria-selected={mode === 'engine'}
                        >
                            Reo-Engine
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {mode === 'original' ? 'Tampilan PDF asli' : 'Teks diekstrak menjadi IR lalu dirender engine'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    {mode === 'original' ? (
                        <>
                            <div className="flex items-center gap-2" role="group" aria-label="Navigasi halaman">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11"
                                    onClick={() => changePage(pageNumber - 1)}
                                    disabled={!pdf || pageNumber <= 1}
                                    aria-label="Halaman sebelumnya"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="min-w-24 text-center text-sm tabular-nums" aria-live="polite">
                                    {pdf ? `${pageNumber} / ${pdf.numPages}` : 'Memuat...'}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11"
                                    onClick={() => changePage(pageNumber + 1)}
                                    disabled={!pdf || pageNumber >= pdf.numPages}
                                    aria-label="Halaman berikutnya"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2" role="group" aria-label="Zoom halaman">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11"
                                    onClick={() => changeScale(-SCALE_STEP)}
                                    disabled={scale <= MIN_SCALE}
                                    aria-label="Perkecil halaman"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="min-w-14 text-center text-sm tabular-nums">{Math.round(scale * 100)}%</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11"
                                    onClick={() => changeScale(SCALE_STEP)}
                                    disabled={scale >= MAX_SCALE}
                                    aria-label="Perbesar halaman"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11"
                                    onClick={() => setScale(1)}
                                    aria-label="Kembalikan ukuran halaman"
                                    title="Kembalikan ukuran halaman"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground" aria-live="polite">
                            {engineStatus === 'loading' && `Membangun Document IR... ${engineProgress}%`}
                            {engineStatus === 'ready' && `${engineProgress}% teks diproses`}
                            {engineStatus === 'empty' && 'PDF ini tidak memiliki layer teks.'}
                            {engineStatus === 'error' && engineError}
                        </p>
                    )}
                </div>

                {mode === 'original' ? (
                    <section className="min-h-[32rem] overflow-auto rounded-xl border bg-slate-100 p-3 dark:bg-slate-950 sm:p-6" aria-label="Halaman PDF">
                        {status === 'loading' && (
                            <div className="flex min-h-[28rem] items-center justify-center text-sm text-slate-700 dark:text-slate-300" role="status">
                                Memuat PDF...
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex min-h-[28rem] flex-col items-center justify-center gap-3 p-8 text-center" role="alert">
                                <FileText className="h-8 w-8 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">PDF tidak dapat dibaca</p>
                                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{errorMessage}</p>
                                </div>
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Muat ulang
                                </Button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className={status === 'ready' ? 'mx-auto block max-w-full shadow-sm' : 'hidden'} />
                    </section>
                ) : (
                    <section className="reader-surface min-h-[32rem] overflow-auto rounded-xl border bg-card p-3 sm:p-6" aria-label="Reader Reo-Engine">
                        {engineStatus === 'loading' && (
                            <div className="flex min-h-[28rem] items-center justify-center text-sm text-muted-foreground" role="status">
                                Mengambil teks halaman...
                            </div>
                        )}
                        {engineStatus === 'error' && (
                            <div className="flex min-h-[28rem] flex-col items-center justify-center gap-3 p-8 text-center" role="alert">
                                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                                <p className="text-sm text-muted-foreground">{engineError}</p>
                                <Button variant="outline" onClick={() => setMode('original')}>
                                    Buka mode Original
                                </Button>
                            </div>
                        )}
                        {engineStatus === 'empty' && (
                            <div className="flex min-h-[28rem] flex-col items-center justify-center gap-3 p-8 text-center">
                                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                                <p className="font-medium">Layer teks tidak tersedia</p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    PDF ini kemungkinan hasil scan. Pilih mode Original untuk melihat halaman.
                                </p>
                                <Button variant="outline" onClick={() => setMode('original')}>
                                    Buka mode Original
                                </Button>
                            </div>
                        )}
                        <div ref={engineRef} className={engineStatus === 'ready' ? 'block' : 'hidden'} />
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
