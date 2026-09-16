<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="font-semibold text-xl text-stone-900 leading-tight tracking-tight">
                    Perangkat Perpustakaan
                </h2>
                <p class="mt-0.5 text-sm text-stone-500">Pantau dan kendalikan PC perpus dari sini</p>
            </div>
            <label class="flex items-center gap-2 text-xs text-stone-500" x-data="{ on: true }" x-init="setInterval(() => { if (on) location.reload(); }, 30000)">
                <input type="checkbox" x-model="on" class="h-4 w-4 rounded accent-orange-600">
                Refresh otomatis
            </label>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-medium uppercase tracking-wider text-stone-500">Total PC</p>
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                            <svg class="h-5 w-5 text-stone-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
                        </span>
                    </div>
                    <p class="mt-2 text-2xl font-bold tracking-tight">{{ $stats['total'] }}</p>
                    <p class="text-xs text-stone-500">terdaftar di panel</p>
                </div>
                <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-medium uppercase tracking-wider text-stone-500">Online</p>
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                            <svg class="h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>
                        </span>
                    </div>
                    <p class="mt-2 text-2xl font-bold tracking-tight text-emerald-600">{{ $stats['online'] }}</p>
                    <p class="text-xs text-stone-500">lapor &lt; 3 menit lalu</p>
                </div>
                <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-medium uppercase tracking-wider text-stone-500">App terbuka</p>
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                            <svg class="h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                        </span>
                    </div>
                    <p class="mt-2 text-2xl font-bold tracking-tight text-sky-600">{{ $stats['app_open'] }}</p>
                    <p class="text-xs text-stone-500">kios sedang tampil</p>
                </div>
                <div class="bg-white shadow-sm rounded-xl border {{ $stats['alerts'] > 0 ? 'border-red-200' : 'border-stone-100' }} p-5">
                    <div class="flex items-center justify-between">
                        <p class="text-xs font-medium uppercase tracking-wider text-stone-500">Perlu perhatian</p>
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg {{ $stats['alerts'] > 0 ? 'bg-red-50' : 'bg-stone-100' }}">
                            <svg class="h-5 w-5 {{ $stats['alerts'] > 0 ? 'text-red-600' : 'text-stone-400' }}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                        </span>
                    </div>
                    <p class="mt-2 text-2xl font-bold tracking-tight {{ $stats['alerts'] > 0 ? 'text-red-600' : '' }}">{{ $stats['alerts'] }}</p>
                    <p class="text-xs text-stone-500">alert belum ditangani</p>
                </div>
            </div>

            <div class="bg-white shadow-sm rounded-xl border border-stone-100">
                <div class="p-5 border-b border-stone-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 class="font-semibold tracking-tight">Daftar PC</h3>
                        <p class="text-sm text-stone-500">{{ $devices->count() }} tampil • klik baris untuk detail</p>
                    </div>
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div class="flex h-9 items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
                            @foreach (['semua' => 'Semua', 'online' => 'Online', 'perhatian' => 'Perhatian'] as $value => $label)
                                <a href="{{ route('devices.index', ['tab' => $value, 'q' => $q]) }}"
                                    class="rounded-md px-3 py-1 text-xs font-medium transition-colors {{ $tab === $value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900' }}">
                                    {{ $label }}
                                </a>
                            @endforeach
                        </div>
                        <form method="GET" action="{{ route('devices.index') }}" class="relative">
                            <input type="hidden" name="tab" value="{{ $tab }}">
                            <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                            <input type="text" name="q" value="{{ $q }}" placeholder="Cari nama, MAC, IP…"
                                class="h-9 w-full sm:w-64 rounded-lg border-stone-200 bg-white pl-9 text-sm shadow-sm focus:border-brand-600 focus:ring-brand-600">
                        </form>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                            <tr class="border-b border-stone-100 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                <th class="px-5 py-3">Perangkat</th>
                                <th class="px-5 py-3">Jaringan</th>
                                <th class="px-5 py-3">Status</th>
                                <th class="px-5 py-3">App</th>
                                <th class="px-5 py-3 text-right">Terakhir lapor</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-stone-100">
                            @forelse ($devices as $d)
                                <tr class="hover:bg-stone-50 cursor-pointer" onclick="location.href='{{ route('devices.show', $d) }}'">
                                    <td class="px-5 py-3">
                                        <div class="flex items-center gap-3">
                                            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ $d->isOnline() ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-400' }} text-sm font-bold">
                                                {{ strtoupper(substr($d->displayName(), 0, 1)) }}
                                            </span>
                                            <div class="min-w-0">
                                                <p class="font-medium text-stone-900 truncate">
                                                    {{ $d->displayName() }}
                                                    @if ($d->unhandled_alerts > 0)
                                                        <span class="ml-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                            {{ $d->unhandled_alerts }}
                                                        </span>
                                                    @endif
                                                </p>
                                                <p class="text-xs text-stone-400 font-mono truncate">{{ $d->hostname }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-3 font-mono text-xs text-stone-600">
                                        {{ $d->mac }}<br>
                                        <span class="text-stone-400">{{ $d->ip ?? '-' }}</span>
                                    </td>
                                    <td class="px-5 py-3">
                                        @if ($d->isOnline())
                                            <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Online
                                            </span>
                                        @else
                                            <span class="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                                                <span class="h-1.5 w-1.5 rounded-full bg-stone-400"></span>Offline
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-5 py-3">
                                        @if ($d->app_open)
                                            <span class="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">Terbuka</span>
                                        @else
                                            <span class="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">Tertutup</span>
                                        @endif
                                    </td>
                                    <td class="px-5 py-3 text-right text-stone-500 whitespace-nowrap">
                                        {{ $d->last_seen_at ? $d->last_seen_at->diffForHumans() : 'Belum pernah' }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-5 py-12 text-center">
                                        <p class="font-medium text-stone-900">Belum ada PC{{ $q ? ' yang cocok' : ' terdaftar' }}</p>
                                        <p class="mt-1 text-sm text-stone-500">
                                            @if ($q)
                                                Coba kata kunci lain atau tab berbeda.
                                            @else
                                                Buka app di PC perpus sekali untuk mendaftarkan otomatis.
                                            @endif
                                        </p>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
