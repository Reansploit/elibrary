import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { useFormShake } from '@/hooks/useFormShake';
import { AlertTriangle, Lock, Trash2 } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const shake = useFormShake(errors);

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Hapus Akun
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Setelah akun kamu dihapus, semua data dan sumber daya akan
                    dihapus secara permanen. Sebelum menghapus akun, harap unduh
                    data atau informasi yang ingin kamu pertahankan.
                </p>
            </header>

            <Button
                variant="destructive"
                onClick={confirmUserDeletion}
                className="h-10"
            >
                <Trash2 className="size-4" />
                Hapus Akun
            </Button>

            <Dialog
                open={confirmingUserDeletion}
                onOpenChange={(open) => !open && closeModal()}
            >
                <DialogContent className="sm:max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="size-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">
                            Hapus Akun?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Setelah akun kamu dihapus, semua data akan dihapus
                            secara permanen. Masukkan password untuk
                            mengonfirmasi.
                        </DialogDescription>
                    </DialogHeader>

                    <motion.form
                        onSubmit={deleteUser}
                        variants={shake.variants}
                        animate={shake.animate}
                        key={shake.key}
                    >
                        <div className="space-y-2 py-2">
                            <Label
                                htmlFor="confirm-password"
                                className="sr-only"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="h-11 pl-10"
                                    placeholder="Masukkan password"
                                    autoFocus
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
                        </div>

                        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Menghapus...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        <Trash2 className="size-4" />
                                        Hapus Akun
                                    </span>
                                )}
                            </Button>
                        </DialogFooter>
                    </motion.form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
