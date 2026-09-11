import { useRef, useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/Components/ui/avatar';
import RippleButton from '@/Components/RippleButton';
import SuccessFeedback from '@/Components/SuccessFeedback';
import { useFormShake } from '@/hooks/useFormShake';
import { Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Mail, AtSign } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: null,
        });

    const shake = useFormShake(errors);

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => {
                setAvatarPreview(null);
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Informasi Profil
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Update informasi profil dan alamat email akun Anda.
                </p>
            </header>

            <motion.form
                onSubmit={submit}
                variants={shake.variants}
                animate={shake.animate}
                key={shake.key}
                className="mt-6 space-y-5"
            >
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar size="lg" className="size-16">
                            {avatarPreview ? (
                                <AvatarImage src={avatarPreview} alt="Preview" />
                            ) : (
                                <>
                                    <AvatarImage src={null} alt={user.name} />
                                    <AvatarFallback className="text-base">
                                        {initials || 'U'}
                                    </AvatarFallback>
                                </>
                            )}
                        </Avatar>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <Camera className="size-3.5" />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Foto Profil
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG. Maksimal 2MB.
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-11 pl-10"
                            required
                            autoFocus
                            autoComplete="name"
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
                </div>

                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                        <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="h-11 pl-10"
                            required
                            autoComplete="username"
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
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="h-11 pl-10"
                            required
                            autoComplete="email"
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
                </div>

                {/* Unverified email notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Alamat email Anda belum diverifikasi.
                        </p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="mt-1 text-sm font-medium text-amber-700 underline transition-colors hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                            Klik di sini untuk kirim ulang email verifikasi.
                        </Link>

                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Tautan verifikasi baru telah dikirim ke email Anda.
                            </p>
                        )}
                    </div>
                )}

                {/* Save button + success indicator */}
                <div className="flex items-center gap-4">
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
                            'Simpan'
                        )}
                    </RippleButton>

                    <SuccessFeedback show={recentlySuccessful} />
                </div>
            </motion.form>
        </section>
    );
}
