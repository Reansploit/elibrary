import { Link } from '@inertiajs/react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KatalogHeader({ libraryName, showBack = false }) {
    return (
        <header className="border-b bg-card">
            <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4">
                {showBack ? (
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('katalog')} aria-label="Kembali ke katalog">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                ) : (
                    <img src="/images/logo-wbs.png" alt={libraryName} className="h-8 w-8 object-contain" />
                )}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">{libraryName}</p>
                    <p className="truncate text-xs text-muted-foreground">Katalog Perpustakaan</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('login')}>
                        <LogIn className="h-4 w-4" />
                        Masuk petugas
                    </Link>
                </Button>
            </div>
        </header>
    );
}
