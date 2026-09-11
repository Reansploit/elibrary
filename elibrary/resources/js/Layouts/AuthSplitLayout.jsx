import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AnimatedCharacters from '@/Components/AnimatedCharacters';
import { useTimeOfDay, getTimeTheme } from '@/hooks/useTimeOfDay';

/**
 * AuthSplitLayout — Two-panel layout for auth pages.
 *
 * Left panel: AnimatedCharacters scene (hidden on mobile)
 * Right panel: Form content (children)
 *
 * Props:
 *  - emotion: 'idle' | 'error' | 'success' — drives character expressions
 *  - characterProps: additional props spread onto AnimatedCharacters.
 *    Use this for pages with custom character interaction (e.g. Login)
 *    that override the built-in blink timers.
 *
 * Built-in:
 *  - Mouse tracking for eye-following
 *  - Random blinking timers (overridable via characterProps)
 *  - Time-of-day themed character filter
 */
export default function AuthSplitLayout({ children, emotion = 'idle', characterProps = {} }) {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const period = useTimeOfDay();
    const timeTheme = getTimeTheme(period);

    /* ---- Cursor tracking ---- */
    const handleMouseMove = useCallback((e) => {
        setMouseX(e.clientX);
        setMouseY(e.clientY);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    /* ---- Blinking timers (recursive, auto-cleaning) ---- */
    useEffect(() => {
        let active = true;

        const scheduleBlink = (setter) => {
            if (!active) return;
            const delay = Math.random() * 4000 + 3000;
            setTimeout(() => {
                if (!active) return;
                setter(true);
                setTimeout(() => {
                    if (!active) return;
                    setter(false);
                    scheduleBlink(setter);
                }, 150);
            }, delay);
        };

        scheduleBlink(setIsPurpleBlinking);
        scheduleBlink(setIsBlackBlinking);

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* ==========================================================
                 Left panel — Animated Characters (hidden on mobile)
                 ========================================================== */}
            <div className="relative hidden flex-1 flex-col items-center justify-between gap-6 bg-muted p-8 lg:flex">
                <AnimatedCharacters
                    mouseX={mouseX}
                    mouseY={mouseY}
                    isPurpleBlinking={isPurpleBlinking}
                    isBlackBlinking={isBlackBlinking}
                    emotion={emotion}
                    timeFilter={timeTheme.filter}
                    {...characterProps}
                />
            </div>

            {/* ==========================================================
                 Right panel — Form content
                 ========================================================== */}
            <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-[45%]">
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile brand */}
                    <div className="mb-6 text-center lg:hidden">
                        <h1 className="text-xl font-semibold tracking-tight">
                            E-Library
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Perpustakaan Digital
                        </p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
}
