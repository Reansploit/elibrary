import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Columns2,
    FileText,
    Maximize2,
    Minimize2,
    Minus,
    Plus,
    RotateCcw,
    SlidersHorizontal,
    Square,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { pdfPagesToDocumentIR } from '@reo-engine/parser-pdf';
import { mountAdaptivePage } from '@reo-engine/renderer-web';
import { analyzePdfPageFromPdf } from '@/lib/pdf-analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MIN_SCALE = 0.6;
const MAX_SCALE = 2;
const FIT_MIN_SCALE = 0.2;
const SCALE_STEP = 0.1;
const TEXT_BATCH_SIZE = 4;
const FIT_PADDING = 48;
const NARROW_QUERY = '(max-width: 767px)';

function formatSize(bytes) {
    if (!bytes) return '0 KB';
    return `${Math.ceil(bytes / 1024)} KB`;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => (
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false
    ));

    useEffect(() => {
        const list = window.matchMedia(query);
        const sync = () => setMatches(list.matches);
        sync();
        list.addEventListener('change', sync);
        return () => list.removeEventListener('change', sync);
    }, [query]);

    return matches;
}

function PageSlot({ pdf, pageNumber, scale, mode, theme, analysis, analysisVersion, onError }) {
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const instanceRef = useRef(null);
    const [renderVersion, setRenderVersion] = useState(0);

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
            .then(() => {
                if (active) setRenderVersion((value) => value + 1);
            })
            .catch((error) => {
                if (active && error?.name !== 'RenderingCancelledException') {
                    onError(error?.message || 'Halaman gagal dirender.');
                }
            });

        return () => {
            active = false;
            renderTask?.cancel();
        };
    }, [pdf, pageNumber, scale]);

    useEffect(() => {
        if (mode !== 'engine' || !analysis || !canvasRef.current || !overlayRef.current) {
            instanceRef.current?.destroy();
            instanceRef.current = null;
            return undefined;
        }

        instanceRef.current = mountAdaptivePage(
            overlayRef.current,
            canvasRef.current,
            analysis,
            { theme: theme === 'dark' ? 'dark' : 'light' },
        );

        return () => {
            instanceRef.current?.destroy();
            instanceRef.current = null;
        };
    }, [mode, analysis, theme, renderVersion, analysisVersion]);

    return (
        <div className="relative shrink-0">
            <canvas ref={canvasRef} className="block max-w-full shadow-sm" />
            <div
                ref={overlayRef}
                className={mode === 'engine'
                    ? 'absolute inset-0'
                    : 'pointer-events-none absolute inset-0 hidden'}
                aria-hidden={mode === 'original'}
            />
        </div>
    );
}

export default function ReaderPdf({ book, file, assetBaseUrl }) {
    const { theme } = useTheme();
    const isNarrow = useMediaQuery(NARROW_QUERY);
    const fullscreenRef = useRef(null);
    const pagesRef = useRef(null);
    const analysisMapRef = useRef(new Map());
    const visiblePagesRef = useRef([]);
    const [pdf, setPdf] = useState(null);
    const [mode, setMode] = useState('original');
    const [layout, setLayout] = useState('single');
    const [pageNumber, setPageNumber] = useState(1);
    const [userScale, setUserScale] = useState(null);
    const [fitScale, setFitScale] = useState(1);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [engineStatus, setEngineStatus] = useState('idle');
    const [engineProgress, setEngineProgress] = useState(0);
    const [engineError, setEngineError] = useState('');
    const [analysisVersion, setAnalysisVersion] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenControls, setShowFullscreenControls] = useState(false);

    const pdfjsAssets = {
        wasmUrl: `${assetBaseUrl}/wasm/`,
        cMapUrl: `${assetBaseUrl}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `${assetBaseUrl}/standard_fonts/`,
        iccUrl: `${assetBaseUrl}/iccs/`,
    };

    const spread = layout === 'spread' && !isNarrow;
    const scale = userScale ?? fitScale;

    const visiblePages = useMemo(() => {
        if (!pdf) return [];
        if (!spread) return [pageNumber];
        if (pageNumber <= 1) return [1];
        const pair = [pageNumber, pageNumber + 1].filter((number) => number <= pdf.numPages);
        return pair;
    }, [pdf, spread, pageNumber]);

    const lastLeftPage = useMemo(() => {
        const total = pdf?.numPages ?? 1;
        if (!spread) return total;
        if (total <= 2) return total;
        return total % 2 === 0 ? total : total - 1;
    }, [pdf, spread]);

    const stepFrom = useCallback((current, direction) => {
        if (!spread) return current + direction;
        if (direction > 0) return current <= 1 ? 2 : current + 2;
        return current <= 2 ? 1 : current - 2;
    }, [spread]);

    useEffect(() => {
        visiblePagesRef.current = visiblePages;
    }, [visiblePages]);

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
        const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    useEffect(() => {
        setShowFullscreenControls(false);
    }, [isFullscreen]);

    useEffect(() => {
        const container = pagesRef.current;
        if (!container || !pdf || visiblePages.length === 0) return undefined;

        let active = true;
        const measure = () => {
            pdf.getPage(visiblePages[0]).then((page) => {
                if (!active) return;
                const base = page.getViewport({ scale: 1 });
                const byHeight = (container.clientHeight - FIT_PADDING) / base.height;
                const byWidth = (container.clientWidth - FIT_PADDING) / (base.width * visiblePages.length);
                setFitScale(clamp(Math.min(byHeight, byWidth), FIT_MIN_SCALE, MAX_SCALE));
            });
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        return () => {
            active = false;
            observer.disconnect();
        };
    }, [pdf, spread, pageNumber, isFullscreen]);

    useEffect(() => {
        let active = true;

        if (mode !== 'engine' || !pdf) {
            setEngineStatus('idle');
            setEngineProgress(0);
            return undefined;
        }

        const extractPages = async () => {
            setEngineStatus('loading');
            setEngineProgress(0);
            setEngineError('');
            analysisMapRef.current.clear();
            setAnalysisVersion((value) => value + 1);
            const pages = [];
            const total = pdf.numPages;

            for (let start = 1; start <= total; start += TEXT_BATCH_SIZE) {
                const numbers = Array.from(
                    { length: Math.min(TEXT_BATCH_SIZE, total - start + 1) },
                    (_, offset) => start + offset,
                );
                const batch = await Promise.all(numbers.map(async (number) => {
                    const analysis = await analyzePdfPageFromPdf(pdf, number);
                    analysisMapRef.current.set(number, analysis);
                    if (active && visiblePagesRef.current.includes(number)) {
                        setAnalysisVersion((value) => value + 1);
                    }
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
            setEngineStatus(documentIR.children.length === 0 ? 'empty' : 'ready');
        };

        extractPages().catch((error) => {
            if (!active) return;
            setEngineStatus('error');
            setEngineError(error.message || 'Ekstraksi teks PDF gagal.');
        });

        return () => {
            active = false;
        };
    }, [mode, pdf, book.id, book.title, book.author]);

    const changePage = useCallback((direction) => {
        setPageNumber((current) => clamp(stepFrom(current, direction), 1, lastLeftPage));
    }, [lastLeftPage, stepFrom]);

    const changeScale = (amount) => {
        setUserScale(clamp(Number(((userScale ?? fitScale) + amount).toFixed(1)), MIN_SCALE, MAX_SCALE));
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            return;
        }
        fullscreenRef.current?.requestFullscreen?.();
    };

    const pageLabel = pdf
        ? (visiblePages.length > 1
            ? `${visiblePages[0]}–${visiblePages[1]} / ${pdf.numPages}`
            : `${pageNumber} / ${pdf.numPages}`)
        : 'Memuat...';

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

                <div
                    ref={fullscreenRef}
                    className={isFullscreen
                        ? 'relative flex h-full flex-col gap-3 overflow-hidden bg-slate-100 p-3 dark:bg-slate-950 sm:p-6'
                        : 'flex flex-col gap-4'}
                >
                    {isFullscreen && (
                        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 sm:bottom-5 sm:right-5">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => setShowFullscreenControls((value) => !value)}
                                aria-expanded={showFullscreenControls}
                                aria-label={showFullscreenControls ? 'Sembunyikan kontrol' : 'Tampilkan kontrol'}
                                title={showFullscreenControls ? 'Sembunyikan kontrol' : 'Tampilkan kontrol'}
                                className="h-9 w-9 border-foreground/20 bg-card/85 text-muted-foreground backdrop-blur hover:bg-card hover:text-foreground"
                            >
                                {showFullscreenControls
                                    ? <X className="h-4 w-4" />
                                    : <SlidersHorizontal className="h-4 w-4" />}
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={toggleFullscreen}
                                aria-label="Keluar dari layar penuh"
                                title="Keluar dari layar penuh"
                                className="h-9 w-9 border-foreground/20 bg-card/85 text-muted-foreground backdrop-blur hover:bg-card hover:text-foreground"
                            >
                                <Minimize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div
                        className={isFullscreen && !showFullscreenControls ? 'hidden' : 'flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3'}
                    >
                        <div className="flex flex-wrap items-center gap-2">
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

                            <div
                                className="hidden items-center gap-2 md:flex"
                                role="group"
                                aria-label="Tata letak halaman"
                            >
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={spread ? 'ghost' : 'default'}
                                    onClick={() => setLayout('single')}
                                    aria-pressed={!spread}
                                >
                                    <Square className="h-4 w-4" />
                                    Tunggal
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={spread ? 'default' : 'ghost'}
                                    onClick={() => setLayout('spread')}
                                    aria-pressed={spread}
                                >
                                    <Columns2 className="h-4 w-4" />
                                    Buku
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                {mode === 'original'
                                    ? 'Tampilan PDF asli'
                                    : 'Teks dianalisis per region, gambar dipertahankan'}
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={toggleFullscreen}
                                aria-pressed={isFullscreen}
                                aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
                                title={isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
                            >
                                {isFullscreen
                                    ? <Minimize2 className="h-4 w-4" />
                                    : <Maximize2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div
                        className={isFullscreen && !showFullscreenControls ? 'hidden' : 'flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3'}
                    >
                        <div className="flex items-center gap-2" role="group" aria-label="Navigasi halaman">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-11 w-11"
                                onClick={() => changePage(-1)}
                                disabled={!pdf || pageNumber <= 1}
                                aria-label="Halaman sebelumnya"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="min-w-28 text-center text-sm tabular-nums" aria-live="polite">
                                {pageLabel}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-11 w-11"
                                onClick={() => changePage(1)}
                                disabled={!pdf || pageNumber >= lastLeftPage}
                                aria-label="Halaman berikutnya"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {mode === 'engine' && (
                                <p className="text-sm text-muted-foreground" aria-live="polite">
                                    {engineStatus === 'loading' && `Menganalisis... ${engineProgress}%`}
                                    {engineStatus === 'ready' && `${engineProgress}% dianalisis`}
                                    {engineStatus === 'empty' && 'Tanpa text layer'}
                                    {engineStatus === 'error' && engineError}
                                </p>
                            )}
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
                                <span className="min-w-14 text-center text-sm tabular-nums">
                                    {Math.round(scale * 100)}%
                                </span>
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
                                    onClick={() => setUserScale(null)}
                                    disabled={userScale === null}
                                    aria-label="Paskan ke layar"
                                    title="Paskan ke layar"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <section
                        ref={pagesRef}
                        className={
                            isFullscreen
                                ? 'flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-slate-100 p-3 dark:bg-slate-950 sm:p-6'
                                : 'flex min-h-[32rem] items-center justify-center overflow-auto rounded-xl border bg-slate-100 p-3 dark:bg-slate-950 sm:p-6'
                        }
                        aria-label={mode === 'original' ? 'Halaman PDF' : 'Halaman PDF adaptif'}
                    >
                        {status === 'loading' && (
                            <div
                                className="flex min-h-[28rem] items-center justify-center text-sm text-slate-700 dark:text-slate-300"
                                role="status"
                            >
                                Memuat PDF...
                            </div>
                        )}
                        {status === 'error' && (
                            <div
                                className="flex min-h-[28rem] flex-col items-center justify-center gap-3 p-8 text-center"
                                role="alert"
                            >
                                <FileText className="h-8 w-8 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                        PDF tidak dapat dibaca
                                    </p>
                                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{errorMessage}</p>
                                </div>
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Muat ulang
                                </Button>
                            </div>
                        )}
                        {status === 'ready' && (
                            <div className={spread ? 'flex items-start gap-1' : 'mx-auto w-fit'}>
                                {visiblePages.map((number) => (
                                    <div
                                        key={number}
                                        className={spread
                                            ? 'first:shadow-[6px_0_10px_-8px_rgba(0,0,0,0.45)]'
                                            : undefined}
                                    >
                                        <PageSlot
                                            pdf={pdf}
                                            pageNumber={number}
                                            scale={scale}
                                            mode={mode}
                                            theme={theme}
                                            analysis={analysisMapRef.current.get(number) ?? null}
                                            analysisVersion={analysisVersion}
                                            onError={(message) => {
                                                setErrorMessage(message);
                                                setStatus('error');
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {mode === 'engine' && status === 'ready' && engineStatus === 'empty' && (
                            <p className="mt-4 text-center text-sm text-slate-700 dark:text-slate-300">
                                PDF ini hasil scan tanpa text layer. Tampilan asli dipertahankan.
                            </p>
                        )}
                    </section>

                    {isFullscreen && showFullscreenControls && (
                        <p className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                            Tekan Esc untuk keluar dari layar penuh
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
