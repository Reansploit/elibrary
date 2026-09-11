import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { LibraryBig } from 'lucide-react';
import GradientOrb from '@/Components/GradientOrb';

export default function GuestLayout({ children }) {
    const { url } = usePage();
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-mesh p-4">
            {/* Gradient orb that follows mouse */}
            <GradientOrb opacity={isDark ? 0.12 : 0.18} />

            {/* Subtle overlay for depth */}
            <div className="pointer-events-none fixed inset-0 backdrop-blur-[1px]" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={url}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Brand */}
                    <div className="mb-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight"
                        >
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <LibraryBig className="size-5 text-primary" />
                            </div>
                            <span>E-Library</span>
                        </Link>
                    </div>

                    {/* Glassmorphism card with animated border */}
                    <div className="animated-border rounded-xl">
                        <div className="relative rounded-xl border bg-white/70 p-6 backdrop-blur-xl sm:p-8 dark:bg-gray-900/80">
                            {children}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
