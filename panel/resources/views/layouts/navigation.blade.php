<nav x-data="{ open: false }">
    <!-- Sidebar desktop terang -->
    <aside class="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-stone-200">
        <a href="{{ route('devices.index') }}" class="flex items-center gap-3 px-5 h-16 border-b border-stone-100">
            <img src="/images/logo-wbs.png" alt="Logo" class="h-9 w-9 object-contain" />
            <span>
                <span class="block text-sm font-semibold text-stone-900 leading-tight">Panel Perpus</span>
                <span class="block text-xs text-stone-500">Kontrol Perangkat</span>
            </span>
        </a>

        <div class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Menu</p>
            <a href="{{ route('devices.index') }}"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors {{ request()->routeIs('devices.*') ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900' }}">
                <svg class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
                Perangkat
            </a>
        </div>

        <div class="border-t border-stone-100 p-3">
            <div class="flex items-center gap-2 rounded-lg bg-stone-50 border border-stone-100 px-2 py-2">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                </span>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-stone-900">{{ Auth::user()->name }}</p>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button class="text-xs text-stone-500 hover:text-stone-900">Keluar</button>
                    </form>
                </div>
            </div>
        </div>
    </aside>

    <!-- Topbar mobile -->
    <div class="lg:hidden bg-white border-b border-stone-200">
        <div class="flex items-center justify-between h-16 px-4">
            <a href="{{ route('devices.index') }}" class="flex items-center gap-2">
                <img src="/images/logo-wbs.png" alt="Logo" class="h-8 w-8 object-contain" />
                <span class="text-sm font-semibold text-stone-900">Panel Perpus</span>
            </a>
            <button @click="open = ! open" class="p-2 rounded-md text-stone-600 hover:bg-stone-100" aria-label="Menu">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
        </div>
        <div x-show="open" class="px-4 pb-4 space-y-1" style="display: none;">
            <a href="{{ route('devices.index') }}" class="block rounded-lg px-3 py-2.5 text-sm font-medium {{ request()->routeIs('devices.*') ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-stone-100' }}">
                Perangkat
            </a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button class="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-100">Keluar</button>
            </form>
        </div>
    </div>
</nav>
