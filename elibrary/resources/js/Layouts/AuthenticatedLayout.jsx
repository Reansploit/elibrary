import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  LibraryBig,
  Sparkles,
  ChevronsUpDown,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
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

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: 'dashboard', desc: 'Ringkasan perpustakaan' },
  { label: 'Buku', icon: BookOpen, href: 'books.index', desc: 'Kelola koleksi buku' },
  { label: 'Anggota', icon: Users, href: 'members.index', desc: 'Data anggota' },
  { label: 'Sirkulasi', icon: ArrowLeftRight, href: 'circulation.index', desc: 'Peminjaman & pengembalian' },
  { label: 'Pengaturan', icon: Settings, href: 'settings.index', desc: 'Konfigurasi sistem' },
];

function NavLink({ item, onClick, onHover, collapsed }) {
  const active = route().current(item.href);
  return (
    <motion.div
      whileHover={{ x: collapsed ? 0 : 4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        href={route(item.href)}
        onClick={onClick}
        onMouseEnter={() => onHover?.(item)}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          collapsed && 'justify-center px-2',
          active
            ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/25'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title={collapsed ? item.desc : undefined}
      >
        {active && !collapsed && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary-foreground/90"
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          />
        )}
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            'group-hover:scale-110'
          )}
        />
        {!collapsed && <span>{item.label}</span>}
        {active && !collapsed && (
          <Sparkles className="ml-auto h-3.5 w-3.5 opacity-70" />
        )}
      </Link>
    </motion.div>
  );
}

export default function AuthenticatedLayout({ children }) {
  const { url, props } = usePage();
  const user = props.auth.user;
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-60';
  const sidebarContentWidth = sidebarCollapsed ? 'w-16' : 'w-60';

  // Show flash messages as sonner toasts
  useEffect(() => {
    if (props.flash?.success) {
      toast.success(props.flash.success);
    }
    if (props.flash?.error) {
      toast.error(props.flash.error);
    }
  }, [props.flash]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="relative flex h-16 items-center gap-3 border-b px-5">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.05 }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
        >
          <LibraryBig className="h-4.5 w-4.5 text-primary-foreground" />
        </motion.div>
        {!sidebarCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-heading text-base font-semibold leading-tight truncate">
              E-Library
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
              Perpustakaan Digital
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {!sidebarCollapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Menu Utama
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              onClick={() => setMobileNavOpen(false)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Dark mode toggle + user info */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              'w-full justify-start gap-2 rounded-xl text-muted-foreground',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </motion.span>
            {!sidebarCollapsed && (
              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            )}
          </Button>
        </div>
        {!sidebarCollapsed && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 text-xs font-semibold">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'Anggota perpustakaan'}</p>
              </div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto mt-2 rounded-xl"
            onClick={() => setSidebarCollapsed(false)}
            title="Expand Sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'relative z-10 hidden lg:flex lg:flex-col lg:border-r lg:bg-card/60 lg:backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}>
        {sidebarContent}
      </aside>

{/* Main Area */}
       <div className="relative z-10 flex min-w-0 flex-1 flex-col min-h-0">
         {/* Top Header */}
         <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-card/70 px-4 backdrop-blur-xl lg:px-6">
          {/* Mobile menu trigger */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>

          {/* Sidebar collapse toggle - only on desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          {/* Page title breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {navItems
              .filter((item) => route().current(item.href))
              .map((item) => (
                <motion.span
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-foreground">{item.label}</span>
                </motion.span>
              ))}
          </div>

          <div className="flex-1" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 gap-2 rounded-full px-2 pl-1.5 transition-all hover:bg-muted/60"
              >
                <motion.span whileHover={{ scale: 1.08 }}>
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 text-xs font-semibold">
                      {initials || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.span>
                <span className="hidden text-sm font-medium sm:inline-block">
                  {user?.name}
                </span>
                <ChevronsUpDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline-block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 text-xs font-semibold">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email || 'Anggota perpustakaan'}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={route('profile.edit')} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={route('logout')}
                  method="post"
                  as="button"
                  className="flex w-full items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

{/* Page Content with Framer Motion */}
         <ScrollArea className="flex-1 min-h-0">
           <AnimatePresence mode="wait">
            <motion.div
              key={url}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: 0.2,
                ease: 'easeInOut',
              }}
              className="mx-auto w-full max-w-7xl p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
}
