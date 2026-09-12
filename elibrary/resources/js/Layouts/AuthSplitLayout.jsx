import { usePage } from '@inertiajs/react';

export default function AuthSplitLayout({ children }) {
    const { props } = usePage();
    const libraryName = props.libraryName || 'E-Library';

    return (
        <div className="flex min-h-screen bg-background">
            <div className="relative hidden flex-1 overflow-hidden lg:block">
                <img
                    src="/bahan/logo-default.jpg"
                    alt="Gedung Yayasan Group Sari Bumi"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
                <div className="relative flex h-full flex-col justify-between p-10 text-white">
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/logo-wbs.png"
                            alt={libraryName}
                            className="h-9 w-9 rounded-lg bg-white/95 object-contain p-0.5"
                        />
                        <img
                            src="/bahan/sb.jpg"
                            alt="Yayasan Group Sari Bumi"
                            className="h-9 w-9 rounded-lg object-cover"
                        />
                        <div>
                            <p className="text-sm font-semibold leading-tight drop-shadow">
                                {libraryName}
                            </p>
                            <p className="text-xs text-white/80">Perpustakaan Digital</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="max-w-md text-2xl font-semibold tracking-tight drop-shadow">
                            Library and Literacy Division Dashboard
                        </h2>
                        <p className="mt-2 text-sm text-white/80">
                            Masuk untuk melanjutkan ke dashboard perpustakaan.
                        </p>
                        <p className="mt-6 text-xs text-white/60">© 2026 {libraryName}</p>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-[480px] lg:shrink-0">
                <div className="w-full max-w-sm">
                    <div className="mb-6 flex items-center gap-2 lg:hidden">
                        <img src="/images/logo-wbs.png" alt={libraryName} className="h-8 w-8 object-contain" />
                        <img
                            src="/bahan/sb.jpg"
                            alt="Yayasan Group Sari Bumi"
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div>
                            <p className="text-sm font-semibold leading-tight">{libraryName}</p>
                            <p className="text-xs text-muted-foreground">Qism Maktabah</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
