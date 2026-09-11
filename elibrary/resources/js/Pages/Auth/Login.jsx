import { useEffect, useState, useCallback } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RippleButton from '@/Components/RippleButton';
import { useFormShake } from '@/hooks/useFormShake';
import { Eye, EyeOff, Lock, ArrowRight, User } from 'lucide-react';

/* ============================================================
   Login Page — Animated Characters Design
   ============================================================ */
export default function Login({ status, canResetPassword }) {
    /* ---- Inertia form ---- */
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    /* ---- UI state ---- */
    const [showPassword, setShowPassword] = useState(false);
    const hasErrors = Object.keys(errors).length > 0;
    const emotion = hasErrors ? 'error' : 'idle';
    const shake = useFormShake(errors);

    /* ---- Cursor tracking ---- */
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    const handleMouseMove = useCallback((e) => {
        setMouseX(e.clientX);
        setMouseY(e.clientY);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    /* ---- Character eye interaction state ---- */
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

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

    /* ---- Peeking timer when password is visible ---- */
    useEffect(() => {
        let active = true;

        if (data.password.length > 0 && showPassword) {
            const schedulePeek = () => {
                if (!active) return;
                const delay = Math.random() * 3000 + 2000;
                setTimeout(() => {
                    if (!active) return;
                    setIsPurplePeeking(true);
                    setTimeout(() => {
                        if (!active) return;
                        setIsPurplePeeking(false);
                        schedulePeek();
                    }, 800);
                }, delay);
            };

            schedulePeek();
            return () => {
                active = false;
            };
        } else {
            setIsPurplePeeking(false);
        }
    }, [data.password, showPassword]);

    /* ---- "Looking at each other" when typing (original behavior) ---- */
    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => {
                setIsLookingAtEachOther(false);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsLookingAtEachOther(false);
        }
    }, [isTyping]);

    /* ---- Derived character props ---- */
    const isPeeking = data.password.length > 0 && showPassword;
    const isHiding = isTyping || (data.password.length > 0 && !showPassword);

    /* ---- Character interaction overrides for AuthSplitLayout ---- */
    const characterProps = {
        mouseX,
        mouseY,
        isPurpleBlinking,
        isBlackBlinking,
        isPurplePeeking,
        isLookingAtEachOther,
        isHiding,
        isPeeking,
    };

    /* ---- Submit handler ---- */
    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout emotion={emotion} characterProps={characterProps}>
            <Head title="Masuk - E-Library" />

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-semibold tracking-tight">
                    Selamat Datang
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Silakan masuk ke akun kamu
                </p>
            </motion.div>

            {/* Flash status */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        key="status"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-6 overflow-hidden rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                        {status}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
                onSubmit={submit}
                variants={shake.variants}
                animate={shake.animate}
                key={shake.key}
                className="space-y-5"
            >
                {/* ---- Username ---- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="space-y-2"
                >
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(false)}
                            className="h-12 pl-10"
                            placeholder="Masukkan username"
                            autoComplete="username"
                            autoFocus
                            required
                        />
                    </div>
                    <AnimatePresence>
                        {errors.username && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-xs text-destructive"
                            >
                                {errors.username}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ---- Password ---- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="space-y-2"
                >
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="h-12 pl-10 pr-10"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            tabIndex={-1}
                            aria-label={
                                showPassword
                                    ? 'Sembunyikan password'
                                    : 'Tampilkan password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                    <AnimatePresence>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-xs text-destructive"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ---- Remember me + Forgot password ---- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="flex items-center justify-between"
                >
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="size-4 rounded border-input accent-primary text-primary transition-colors focus:ring-1 focus:ring-ring focus:ring-offset-1"
                        />
                        <span className="select-none text-sm text-muted-foreground">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                            Lupa password?
                        </Link>
                    )}
                </motion.div>

                {/* ---- Submit ---- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <RippleButton
                        type="submit"
                        className="h-12 w-full text-base"
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Memproses...
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                Masuk
                                <ArrowRight className="size-4" />
                            </span>
                        )}
                    </RippleButton>
                </motion.div>
            </motion.form>

            {/* ---- Register link ---- */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 text-center text-sm text-muted-foreground"
            >
                Belum punya akun?{' '}
                <Link
                    href={route('register')}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                    Daftar sekarang
                </Link>
            </motion.p>
        </AuthSplitLayout>
    );
}
