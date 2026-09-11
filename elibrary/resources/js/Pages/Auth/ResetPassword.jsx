import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RippleButton from '@/Components/RippleButton';
import { useFormShake } from '@/hooks/useFormShake';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, RotateCcw } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const hasErrors = Object.keys(errors).length > 0;
    const emotion = hasErrors ? 'error' : 'idle';
    const shake = useFormShake(errors);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout emotion={emotion}>
            <Head title="Reset Password - E-Library" />

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 text-center"
            >
                <h1 className="text-xl font-semibold tracking-tight">
                    Reset Password
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Buat password baru untuk akun kamu
                </p>
            </motion.div>

            <motion.form
                onSubmit={submit}
                variants={shake.variants}
                animate={shake.animate}
                key={shake.key}
                className="space-y-4"
            >
                {/* Email (disabled, pre-filled) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="space-y-2"
                >
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
                            disabled
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

                {/* Password */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="space-y-2"
                >
                    <Label htmlFor="password">Password Baru</Label>
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
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="space-y-2"
                >
                    <Label htmlFor="password_confirmation">
                        Konfirmasi Password Baru
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

                {/* Submit */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                    className="pt-2"
                >
                    <RippleButton
                        type="submit"
                        className="h-11 w-full text-base"
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Memproses...
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <RotateCcw className="size-4" />
                                Reset Password
                            </span>
                        )}
                    </RippleButton>
                </motion.div>
            </motion.form>
        </AuthSplitLayout>
    );
}
