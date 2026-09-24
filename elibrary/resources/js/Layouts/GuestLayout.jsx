import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';

// Layout halaman tamu (login, register, dll).
// Alasan gaya (R-31): kartu solid tanpa dekorasi. Satu-satunya gerak adalah
// fade saat pindah halaman, tujuannya orientasi (pengguna tahu halamannya
// berganti), bukan hiasan. Dial MOTION 1.
export default function GuestLayout({ children }) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-md"
                >
                    {/* Brand */}
                    <div className="mb-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight"
                        >
                            <img
                                src="/images/logo-wbs.png"
                                alt="Logo Perpustakaan WBS"
                                className="size-10 object-contain"
                            />
                            <span>Perpustakaan WBS</span>
                        </Link>
                    </div>

                    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
                        {children}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
