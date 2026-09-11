import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import RippleButton from '@/Components/RippleButton';
import { motion, AnimatePresence } from 'framer-motion';
import { MailCheck, LogOut, Send } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthSplitLayout emotion="idle">
            <Head title="Verifikasi Email - E-Library" />

            {/* Icon + Heading */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 text-center"
            >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <MailCheck className="size-7 text-primary" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight">
                    Verifikasi Email
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Terima kasih telah mendaftar! Sebelum memulai, bisa verifikasi alamat email
                    kamu dengan mengklik tautan yang kami kirimkan ke email kamu.
                </p>
            </motion.div>

            {/* Flash status */}
            <AnimatePresence>
                {status === 'verification-link-sent' && (
                    <motion.div
                        key="status"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-4 overflow-hidden rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                        Tautan verifikasi baru telah dikirim ke alamat email yang kamu daftarkan.
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-4"
            >
                <form onSubmit={submit}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
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
                                    Kirim Ulang Email Verifikasi
                                </span>
                            )}
                        </RippleButton>
                    </motion.div>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                    className="text-center"
                >
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <LogOut className="size-3.5" />
                        Keluar
                    </Link>
                </motion.div>
            </motion.div>
        </AuthSplitLayout>
    );
}
