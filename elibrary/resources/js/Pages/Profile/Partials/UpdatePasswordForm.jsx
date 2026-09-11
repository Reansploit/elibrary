import { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RippleButton from '@/Components/RippleButton';
import PasswordStrength from '@/Components/PasswordStrength';
import SuccessFeedback from '@/Components/SuccessFeedback';
import { useFormShake } from '@/hooks/useFormShake';
import { Lock, KeyRound, ShieldCheck, Save } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const shake = useFormShake(errors);

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Ganti Password
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pastikan akun kamu menggunakan password yang kuat dan acak.
                </p>
            </header>

            <motion.form
                onSubmit={updatePassword}
                variants={shake.variants}
                animate={shake.animate}
                key={shake.key}
                className="mt-6 space-y-5"
            >
                {/* Current Password */}
                <div className="space-y-2">
                    <Label htmlFor="current_password">Password Saat Ini</Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type="password"
                            className="h-11 pl-10"
                            autoComplete="current-password"
                            placeholder="Masukkan password saat ini"
                        />
                    </div>
                    <AnimatePresence>
                        {errors.current_password && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-xs text-destructive"
                            >
                                {errors.current_password}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password Baru</Label>
                    <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            type="password"
                            className="h-11 pl-10"
                            autoComplete="new-password"
                            placeholder="••••••••"
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
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        Konfirmasi Password Baru
                    </Label>
                    <div className="relative">
                        <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            type="password"
                            className="h-11 pl-10"
                            autoComplete="new-password"
                            placeholder="••••••••"
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
                </div>

                {/* Save + success */}
                <div className="flex items-center gap-4 pt-2">
                    <RippleButton
                        type="submit"
                        disabled={processing}
                        className="h-10"
                    >
                        {processing ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Menyimpan...
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <Save className="size-4" />
                                Simpan
                            </span>
                        )}
                    </RippleButton>

                    <SuccessFeedback show={recentlySuccessful} />
                </div>
            </motion.form>
        </section>
    );
}
