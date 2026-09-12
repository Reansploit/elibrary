import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthSplitLayout>
            <Head title="Lupa Password" />
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Lupa password?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Masukkan email untuk menerima tautan reset.
                </p>
            </div>
            {status && (
                <div className="mb-4 rounded-lg border bg-muted/50 px-3 py-2 text-sm">{status}</div>
            )}
            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="contoh@email.com"
                        autoFocus
                        required
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Mengirim...' : 'Kirim tautan reset'}
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href={route('login')} className="font-medium text-foreground hover:underline">
                    Kembali masuk
                </Link>
            </p>
        </AuthSplitLayout>
    );
}
