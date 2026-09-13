import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    ArrowLeftRight,
    Menu,
    Sun,
    Moon,
    User,
    LogOut,
    Settings,
    ChevronsUpDown,
    ChevronDown,
    Lock,
    Gavel,
    MapPin,
    Ticket,
    ScrollText,
    FileText,
    Database,
    Archive,
    ClipboardCheck,
    MoreHorizontal,
    BookMarked,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useCan } from '@/hooks/useCan';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const dashboardItem = { label: 'Dashboard', icon: LayoutDashboard, href: 'dashboard', match: ['dashboard'] };

const navGroups = [
    {
        label: 'Data',
        icon: Database,
        items: [
            {
                label: 'Buku',
                icon: BookOpen,
                href: 'books.index',
                match: ['books.index', 'books.create', 'books.edit', 'books.management', 'books.show'],
                permission: ['view_books', 'manage_books'],
            },
            {
                label: 'Anggota',
                icon: Users,
                href: 'members.index',
                match: ['members.index', 'members.create', 'members.edit', 'members.show'],
                permission: ['view_members', 'manage_members'],
            },
            {
                label: 'Lokasi',
                icon: MapPin,
                href: 'lokasi.index',
                match: ['lokasi.index', 'lokasi.create', 'lokasi.edit'],
                permission: ['view_books', 'manage_books'],
            },
            {
                label: 'Opname',
                icon: ClipboardCheck,
                href: 'opname.index',
                match: ['opname.index'],
                permission: ['edit_books', 'manage_books'],
            },
        ],
    },
    {
        label: 'Transaksi',
        icon: ArrowLeftRight,
        items: [
            {
                label: 'Sirkulasi',
                icon: ArrowLeftRight,
                href: 'circulation.index',
                match: ['circulation.index', 'circulation.create', 'circulation.overdue'],
                permission: ['view_circulation'],
            },
            {
                label: 'Reservasi',
                icon: Ticket,
                href: 'reservasi.index',
                match: ['reservasi.index'],
                permission: ['view_reservations', 'manage_reservations'],
            },
            {
                label: 'Pembatasan',
                icon: Gavel,
                href: 'sanksi.index',
                match: ['sanksi.index'],
                permission: ['view_members', 'manage_members'],
            },
        ],
    },
    {
        label: 'Arsip',
        icon: Archive,
        items: [
            {
                label: 'Riwayat',
                icon: ScrollText,
                href: 'log.index',
                match: ['log.index'],
                permission: ['view_logs'],
            },
            {
                label: 'Laporan',
                icon: FileText,
                href: 'laporan.index',
                match: ['laporan.index', 'laporan.export'],
                permission: ['view_reports'],
            },
        ],
    },
    {
        label: 'Lainnya',
        icon: MoreHorizontal,
        items: [
            {
                label: 'Pengaturan',
                icon: Settings,
                href: 'settings.index',
                match: ['settings.index'],
                permission: ['manage_settings'],
            },
        ],
    },
];

const allNavItems = [dashboardItem, ...navGroups.flatMap((g) => g.items)];

const panduanItem = {
    label: 'Panduan',
    icon: BookMarked,
    href: 'panduan',
    match: ['panduan'],
};

function isNavActive(item) {
    try {
        return item.match.some((name) => route().current(name));
    } catch {
        return false;
    }
}

function NavLink({ item, onClick, collapsed }) {
    const can = useCan();
    const active = isNavActive(item);
    const Icon = item.icon;

    if (item.permission && !can(item.permission)) {
        return (
            <div
                title={`${item.label} — tidak punya akses`}
                aria-disabled="true"
                className={cn(
                    'flex cursor-not-allowed items-center gap-3.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-40',
                    collapsed && 'justify-center px-0'
                )}
            >
                <Lock className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
            </div>
        );
    }

    return (
        <Link
            href={route(item.href)}
            onClick={onClick}
            title={collapsed ? item.label : undefined}
            className={cn(
                'flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
    );
}

function NavGroup({ group, collapsed, onNavigate, open, onToggle, miniOpen, onMiniToggle }) {
    if (collapsed) {
        const GroupIcon = group.icon;
        const hasActive = group.items.some((item) => isNavActive(item));
        return (
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={onMiniToggle}
                    title={group.label}
                    aria-expanded={miniOpen}
                    className={cn(
                        'flex items-center justify-center rounded-lg px-0 py-2.5 text-sm font-medium transition-colors',
                        hasActive || miniOpen
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                >
                    <GroupIcon className="h-4 w-4 shrink-0" />
                </button>
                {miniOpen && (
                    <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-1.5">
                        {group.items.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                onClick={onNavigate}
                                collapsed
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground"
            >
                <span>{group.label}</span>
                <ChevronDown
                    className={cn(
                        'h-3.5 w-3.5 transition-transform',
                        !open && '-rotate-90'
                    )}
                />
            </button>
            {open && (
                <div className="flex flex-col gap-2">
                    {group.items.map((item) => (
                        <NavLink key={item.href} item={item} onClick={onNavigate} collapsed={false} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AuthenticatedLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth.user;
    const libraryName = props.libraryName || 'E-Library';
    const { theme, toggleTheme } = useTheme();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            if (saved !== null) return saved === 'true';
            return window.innerWidth < 1024;
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    // Grup yang terbuka — default: grup berisi halaman aktif.
    const [openGroups, setOpenGroups] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('sidebarGroups') || '{}');
            const initial = {};
            for (const group of navGroups) {
                initial[group.label] =
                    typeof saved[group.label] === 'boolean'
                        ? saved[group.label]
                        : group.items.some((item) => isNavActive(item));
            }
            return initial;
        } catch {
            const initial = {};
            for (const group of navGroups) {
                initial[group.label] = group.items.some((item) => isNavActive(item));
            }
            return initial;
        }
    });

    const toggleGroup = (label) => {
        setOpenGroups((prev) => {
            const next = { ...prev, [label]: !prev[label] };
            try {
                localStorage.setItem('sidebarGroups', JSON.stringify(next));
            } catch {
                // abaikan bila storage penuh/diblokir
            }
            return next;
        });
    };

    // Grup yang dibuka di mode minim (ikon) — cukup satu dalam sekali waktu.
    const [miniGroup, setMiniGroup] = useState(null);

    const initials =
        user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';

    const activeItem = [...allNavItems, panduanItem].find((item) => isNavActive(item));

    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success);
        if (props.flash?.error) toast.error(props.flash.error);
    }, [props.flash]);

    const sidebarContent = (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-3 border-b px-4">
                <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card outline-none transition-colors hover:bg-muted"
                    title={sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
                >
                    <img src="/images/logo-wbs.png" alt="Logo" className="h-6 w-6 object-contain" />
                </button>
                {!sidebarCollapsed && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold leading-tight">{libraryName}</p>
                        <p className="truncate text-xs text-muted-foreground">Qism Maktabah</p>
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="flex flex-col gap-2">
                    <NavLink
                        item={dashboardItem}
                        onClick={() => setMobileNavOpen(false)}
                        collapsed={sidebarCollapsed}
                    />
                    {navGroups.map((group) => (
                        <NavGroup
                            key={group.label}
                            group={group}
                            collapsed={sidebarCollapsed}
                            onNavigate={() => setMobileNavOpen(false)}
                            open={!!openGroups[group.label]}
                            onToggle={() => toggleGroup(group.label)}
                            miniOpen={miniGroup === group.label}
                            onMiniToggle={() =>
                                setMiniGroup((prev) => (prev === group.label ? null : group.label))
                            }
                        />
                    ))}
                </nav>
            </ScrollArea>

            <div className="space-y-1 border-t p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className={cn('w-full justify-start gap-2', sidebarCollapsed && 'justify-center px-0')}
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {!sidebarCollapsed && (
                        <span className="text-sm">
                            {theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
                        </span>
                    )}
                </Button>
                <NavLink
                    item={panduanItem}
                    onClick={() => setMobileNavOpen(false)}
                    collapsed={sidebarCollapsed}
                />
                {!sidebarCollapsed && (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2 py-2">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user?.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {user?.email || (user?.username ? `@${user.username}` : '')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <aside
                className={cn(
                    'hidden border-r bg-card lg:flex lg:flex-col',
                    sidebarCollapsed ? 'w-16' : 'w-64'
                )}
            >
                {sidebarContent}
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
                    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
                            <Menu className="h-5 w-5" />
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2">
                        {activeItem ? (
                            <>
                                <span className="flex h-7 w-7 items-center justify-center rounded-md border bg-muted">
                                    <activeItem.icon className="h-4 w-4" />
                                </span>
                                <span className="text-sm font-medium">{activeItem.label}</span>
                            </>
                        ) : (
                            <span className="text-sm font-medium">{libraryName}</span>
                        )}
                    </div>

                    <div className="flex-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-9 gap-2 px-2" />}>
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="hidden max-w-32 truncate text-sm sm:inline-block">
                                {user?.name}
                            </span>
                            <ChevronsUpDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline-block" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5">
                                <p className="truncate text-sm font-medium">{user?.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user?.email || (user?.username ? `@${user.username}` : '')}
                                </p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem render={<Link href={route('profile.edit')} className="flex items-center gap-2" />}>
                                <User className="h-4 w-4" />
                                Profil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem render={<Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-2 text-destructive" />}>
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <ScrollArea className="min-h-0 flex-1">
                    <main key={url} className="mx-auto w-full max-w-6xl space-y-6 p-4 lg:p-6">
                        {children}
                    </main>
                </ScrollArea>
            </div>
        </div>
    );
}
