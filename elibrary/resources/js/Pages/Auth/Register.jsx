import { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RippleButton from '@/Components/RippleButton';
import PasswordStrength from '@/Components/PasswordStrength';
import { useFormShake } from '@/hooks/useFormShake';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowLeft, Check, ArrowRight } from 'lucide-react';

const STEPS = ['Informasi Akun', 'Keamanan'];

export default function Register() {
    const [step, setStep] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const hasErrors = Object.keys(errors).length > 0;
    const emotion = hasErrors ? 'error' : 'idle';
    const shake = useFormShake(errors);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const canGoNext =
        step === 0 &&
        data.name.trim().length > 0 &&
        data.username.trim().length > 0 &&
        data.email.trim().length > 0;

    const handleNext = () => {
        if (canGoNext) setStep(1);
    };

    const handleBack = () => {
        setStep(0);
    };

    /* ─── shared field animation ─── */
    const fieldProps = (delay) => ({
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay },
    });

    /* ─── AnimatePresence key for step transitions ─── */
    const stepKey = `step-${step}-${hasErrors ? 'err' : 'ok'}`;

    return (
        <AuthSplitLayout emotion={emotion}>
            <Head title="Daftar - E-Library" />

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 text-center"
            >
                <h1 className="text-xl font-semibold tracking-tight">
                    Buat Akun Baru
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Daftar untuk mulai menggunakan E-Library
                </p>
            </motion.div>

            {/* Step indicator */}
            <div className="mb-6 flex items-center justify-center gap-3">
                {STEPS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div
                            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                                i === step
                                    ? 'bg-primary text-primary-foreground'
                                    : i < step
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {i < step ? <Check className="size-3.5" /> : i + 1}
                        </div>
                        <span
                            className={`hidden text-xs font-medium sm:inline ${
                                i === step
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`mx-1 h-px w-6 transition-colors duration-300 ${
                                    i < step ? 'bg-emerald-500' : 'bg-border'
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* ─── Multi-step form ─── */}
            <motion.form
                onSubmit={submit}
                variants={shake.variants}
                animate={shake.animate}
                className="space-y-4"
            >
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key={`${stepKey}-fields`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Name */}
                            <motion.div {...fieldProps(0.05)} className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="h-11 pl-10"
                                        autoComplete="name"
                                        autoFocus
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-xs text-destructive"
                                        >
                                            {errors.name}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Username */}
                            <motion.div {...fieldProps(0.1)} className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={data.username}
                                        className="h-11 pl-10"
                                        autoComplete="username"
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Masukkan username"
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

                            {/* Email */}
                            <motion.div {...fieldProps(0.15)} className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="h-11 pl-10"
                                        autoComplete="email"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contoh@email.com"
                                        required
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-xs text-destructive"
                                        >
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Next button */}
                            <motion.div
                                {...fieldProps(0.2)}
                                className="pt-2"
                            >
                                <RippleButton
                                    type="button"
                                    onClick={handleNext}
                                    className="h-11 w-full text-base"
                                    disabled={!canGoNext}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        Lanjutkan
                                        <ArrowRight className="size-4" />
                                    </span>
                                </RippleButton>
                            </motion.div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key={`${stepKey}-fields`}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Password */}
                            <motion.div {...fieldProps(0.05)} className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="h-11 pl-10"
                                        autoComplete="new-password"
                                        autoFocus
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <PasswordStrength password={data.password} />
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

                            {/* Confirm Password */}
                            <motion.div {...fieldProps(0.1)} className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Password
                                </Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="h-11 pl-10"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.password_confirmation && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-xs text-destructive"
                                        >
                                            {errors.password_confirmation}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Back + Submit */}
                            <motion.div {...fieldProps(0.15)} className="flex gap-3 pt-2">
                                <RippleButton
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    className="h-11 w-1/3"
                                >
                                    <ArrowLeft className="size-4" />
                                </RippleButton>
                                <RippleButton
                                    type="submit"
                                    className="h-11 flex-1 text-base"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2">
                                            <UserPlus className="size-4" />
                                            Daftar
                                        </span>
                                    )}
                                </RippleButton>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Login link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="pt-2 text-center"
                >
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Sudah punya akun? Masuk
                    </Link>
                </motion.div>
            </motion.form>
        </AuthSplitLayout>
    );
}
