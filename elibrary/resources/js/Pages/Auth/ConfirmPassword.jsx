import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <AuthSplitLayout>
            <Head title="Konfirmasi Password" />
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Konfirmasi password</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Area aman — konfirmasi password sebelum lanjut.
                </p>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Masukkan password"
                        autoFocus
                        required
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Memproses...' : 'Konfirmasi'}
                </Button>
            </form>
        </AuthSplitLayout>
    );
}
