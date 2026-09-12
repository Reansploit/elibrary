import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthSplitLayout>
            <Head title="Verifikasi Email" />
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Verifikasi email</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Klik tautan verifikasi yang dikirim ke email kamu sebelum memulai.
                </p>
            </div>
            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                    Tautan verifikasi baru telah dikirim.
                </div>
            )}
            <form onSubmit={submit} className="space-y-3">
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Mengirim...' : 'Kirim ulang verifikasi'}
                </Button>
                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Keluar
                    </Link>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
