import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RippleButton from '@/Components/RippleButton';
import { useFormShake } from '@/hooks/useFormShake';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const hasErrors = Object.keys(errors).length > 0;
    const emotion = hasErrors ? 'error' : 'idle';
    const shake = useFormShake(errors);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout emotion={emotion}>
            <Head title="Konfirmasi Password - E-Library" />

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 text-center"
            >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="size-7 text-primary" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight">
                    Konfirmasi Password
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Ini adalah area aman. Harap konfirmasi password kamu sebelum melanjutkan.
                </p>
            </motion.div>

            <motion.form
                onSubmit={submit}
                variants={shake.variants}
                animate={shake.animate}
                key={shake.key}
                className="space-y-4"
            >
                {/* Password */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="space-y-2"
                >
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="h-11 pl-10"
                            autoFocus
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Masukkan password"
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

                {/* Submit */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
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
                                <ShieldCheck className="size-4" />
                                Konfirmasi
                            </span>
                        )}
                    </RippleButton>
                </motion.div>
            </motion.form>
        </AuthSplitLayout>
    );
}
