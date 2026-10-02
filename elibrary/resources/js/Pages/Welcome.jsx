import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/Components/ui/button';

// Landing publik Perpustakaan WBS.
// Design Read: halaman depan untuk santri dan guru, bahasa Indonesia,
// gaya kelembagaan yang tenang. Dial ENERGY 1 / RHYTHM 1 / MOTION 1.
// Alasan tiap keputusan (R-31): logo + nama sebagai identitas (bukan dekorasi),
// dua tombol sesuai dua kebutuhan nyata (lihat koleksi, masuk petugas),
// tanpa statistik/klaim karena datanya tidak ditampilkan di sini (R-17, R-36).
export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Perpustakaan WBS" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
                <main className="flex w-full max-w-md flex-col items-center text-center">
                    <img
                        src="/images/logo-wbs.png"
                        alt="Logo Perpustakaan WBS"
                        className="h-20 w-20 object-contain"
                    />
                    <h1 className="mt-6 text-2xl font-bold tracking-tight">
                        Perpustakaan WBS
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sistem informasi perpustakaan pondok.
                    </p>
                    <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className={buttonVariants({ variant: 'outline', size: 'lg' })}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className={buttonVariants({ variant: 'outline', size: 'lg' })}
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </main>
                <footer className="pb-8 text-center text-xs text-muted-foreground">
                    Copyright © {new Date().getFullYear()} Studio-Alpaca
                </footer>
            </div>
        </>
    );
}
