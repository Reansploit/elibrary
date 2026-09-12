import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout>
            <Head title="Reset Password" />
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
                <p className="mt-1 text-sm text-muted-foreground">Buat password baru untuk akunmu.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} disabled />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password baru</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                        required
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
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
                        <p className="text-xs text-destructive">{errors.password_confirmation}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Memproses...' : 'Reset password'}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}
