import { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const STEPS = ['Akun', 'Keamanan'];

export default function Register() {
    const [step, setStep] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const canGoNext =
        data.name.trim().length > 0 &&
        data.username.trim().length > 0 &&
        data.email.trim().length > 0;

    return (
        <AuthSplitLayout>
            <Head title="Daftar" />

            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Buat akun baru</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Langkah {step + 1} dari 2: {STEPS[step]}
                </p>
            </div>

            <div className="mb-6 flex gap-2">
                {STEPS.map((label, i) => (
                    <div
                        key={label}
                        className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`}
                    />
                ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
                {step === 0 && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama lengkap</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap"
                                autoFocus
                                required
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Username"
                                required
                            />
                            {errors.username && (
                                <p className="text-xs text-destructive">{errors.username}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="contoh@email.com"
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>
                        <Button
                            type="button"
                            className="w-full"
                            disabled={!canGoNext}
                            onClick={() => canGoNext && setStep(1)}
                        >
                            Lanjutkan
                        </Button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                autoFocus
                                required
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Konfirmasi password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            {errors.password_confirmation && (
                                <p className="text-xs text-destructive">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep(0)}
                            >
                                Kembali
                            </Button>
                            <Button type="submit" className="flex-1" disabled={processing}>
                                {processing ? 'Memproses...' : 'Daftar'}
                            </Button>
                        </div>
                    </>
                )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link href={route('login')} className="font-medium text-foreground hover:underline">
                    Masuk
                </Link>
            </p>
        </AuthSplitLayout>
    );
}
