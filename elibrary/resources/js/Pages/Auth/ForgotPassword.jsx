import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RippleButton from '@/Components/RippleButton';
import { useFormShake } from '@/hooks/useFormShake';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const hasErrors = Object.keys(errors).length > 0;
    const emotion = hasErrors ? 'error' : 'idle';
    const shake = useFormShake(errors);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthSplitLayout emotion={emotion}>
            <Head title="Lupa Password - E-Library" />

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 text-center"
            >
                <h1 className="text-xl font-semibold tracking-tight">
                    Lupa Password?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Masukkan email kamu dan kami akan kirim tautan reset password
                </p>
            </motion.div>

            {/* Status flash */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        key="status"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-4 overflow-hidden rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                        {status}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.form
                onSubmit={submit}
                variants={shake.variants}
                animate={shake.animate}
                key={shake.key}
                className="space-y-4"
            >
                {/* Email */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="space-y-2"
                >
                    <Label htmlFor="email">Alamat Email</Label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="h-11 pl-10"
                            autoComplete="email"
                            autoFocus
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
                                Mengirim...
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <Send className="size-4" />
                                Kirim Tautan Reset
                            </span>
                        )}
                    </RippleButton>
                </motion.div>

                {/* Back to Login */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="pt-2 text-center"
                >
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Kembali ke halaman masuk
                    </Link>
                </motion.div>
            </motion.form>
        </AuthSplitLayout>
    );
}
