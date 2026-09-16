<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <a href="{{ route('devices.index') }}" class="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:text-stone-900" aria-label="Kembali">
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                </a>
                <div>
                    <h2 class="font-semibold text-xl text-stone-900 leading-tight tracking-tight">
                        {{ $device->displayName() }}
                    </h2>
                    <p class="text-sm text-stone-500 font-mono">{{ $device->hostname }} • {{ $device->mac }}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                @if ($device->isOnline())
                    <span class="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-xs font-medium text-emerald-700">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Online
                    </span>
                @else
                    <span class="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone-100 px-3 text-xs font-medium text-stone-500">
                        <span class="h-1.5 w-1.5 rounded-full bg-stone-400"></span>Offline
                    </span>
                @endif
                @if ($device->app_open)
                    <span class="inline-flex h-9 items-center rounded-full bg-sky-50 px-3 text-xs font-medium text-sky-700">App terbuka</span>
                @else
                    <span class="inline-flex h-9 items-center rounded-full bg-stone-100 px-3 text-xs font-medium text-stone-500">App tertutup</span>
                @endif
                <form method="POST" action="{{ route('devices.destroy', $device) }}"
                    onsubmit="return confirm('Hapus {{ $device->displayName() }} dari panel? Riwayat ikut terhapus.')">
                    @csrf
                    @method('DELETE')
                    <button class="inline-flex h-9 items-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700">Hapus</button>
                </form>
            </div>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif
            @if ($errors->any())
                <div class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
                    {{ $errors->first() }}
                </div>
            @endif

            <div class="flex gap-1 self-start rounded-lg border border-stone-200 bg-white p-1 w-fit">
                <a href="{{ route('devices.show', ['device' => $device->id, 'tab' => 'ringkasan']) }}"
                    class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors {{ $tab === 'ringkasan' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900' }}">
                    Ringkasan
                </a>
                <a href="{{ route('devices.show', ['device' => $device->id, 'tab' => 'aktivitas']) }}"
                    class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors {{ $tab === 'aktivitas' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900' }}">
                    Aktivitas
                </a>
            </div>

            @if ($tab === 'ringkasan')
                <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5">
                    <h3 class="font-semibold tracking-tight">Aplikasi terbuka di PC ({{ count($device->open_apps ?? []) }})</h3>
                    <p class="text-xs text-stone-500 mb-3">Diperbarui tiap lapor (±10 detik) • window depan: {{ $device->active_title ?? '-' }}</p>
                    @if (count($device->open_apps ?? []) > 0)
                        <div class="flex flex-wrap gap-2">
                            @foreach ($device->open_apps as $app)
                                <span class="inline-flex max-w-64 truncate rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs text-stone-700" title="{{ $app }}">{{ $app }}</span>
                            @endforeach
                        </div>
                    @else
                        <p class="text-sm text-stone-500">Belum ada data — menunggu lapor agen berikutnya.</p>
                    @endif
                </div>
                <div class="grid gap-4 lg:grid-cols-3">
                    <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5 text-sm">
                        <h3 class="font-semibold tracking-tight mb-3">Info perangkat</h3>
                        <dl class="space-y-2">
                            <div class="flex justify-between gap-4">
                                <dt class="text-stone-500">IP terakhir</dt>
                                <dd class="font-mono">{{ $device->ip ?? '-' }}</dd>
                            </div>
                            <div class="flex justify-between gap-4">
                                <dt class="text-stone-500">Versi agen</dt>
                                <dd class="font-mono">v{{ $device->agent_version ?? '-' }}</dd>
                            </div>
                            <div class="flex justify-between gap-4">
                                <dt class="text-stone-500">Window aktif</dt>
                                <dd class="text-right truncate max-w-48">{{ $device->active_title ?? '-' }}</dd>
                            </div>
                            <div class="flex justify-between gap-4">
                                <dt class="text-stone-500">Terakhir lapor</dt>
                                <dd>{{ $device->last_seen_at ? $device->last_seen_at->diffForHumans() : 'Belum pernah' }}</dd>
                            </div>
                        </dl>
                        <form method="POST" action="{{ route('devices.rename', $device) }}" class="flex gap-2 pt-3">
                            @csrf
                            @method('PATCH')
                            <input type="text" name="custom_name" value="{{ $device->custom_name }}" placeholder="Nama baru (kosongkan = hostname)"
                                class="flex-1 min-w-0 h-9 rounded-lg border-stone-200 text-sm shadow-sm focus:border-brand-600 focus:ring-brand-600">
                            <button class="h-9 shrink-0 rounded-lg bg-stone-900 text-white px-3 text-sm font-medium">Rename</button>
                        </form>
                    </div>

                    <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5 text-sm">
                        <h3 class="font-semibold tracking-tight mb-1">Perintah remote</h3>
                        <p class="text-stone-500 text-xs mb-3">Dijalankan agen saat lapor berikutnya (±10 detik).</p>
                        <div class="flex flex-wrap gap-2">
                            <form method="POST" action="{{ route('devices.command', $device) }}">
                                @csrf
                                <input type="hidden" name="action" value="open_app">
                                <button class="h-9 rounded-lg bg-emerald-600 text-white px-4 text-sm font-medium hover:bg-emerald-700">Buka app</button>
                            </form>
                            <form method="POST" action="{{ route('devices.command', $device) }}">
                                @csrf
                                <input type="hidden" name="action" value="close_app">
                                <button class="h-9 rounded-lg bg-red-600 text-white px-4 text-sm font-medium hover:bg-red-700">Tutup app</button>
                            </form>
                            <form method="POST" action="{{ route('devices.command', $device) }}">
                                @csrf
                                <input type="hidden" name="action" value="restart_agent">
                                <button class="h-9 rounded-lg bg-white border border-stone-200 px-4 text-sm font-medium hover:bg-stone-50">Restart agen</button>
                            </form>
                        </div>
                        @if ($pending->count())
                            <div class="pt-3 space-y-1.5">
                                <p class="text-xs font-medium text-amber-700">Menunggu dijalankan:</p>
                                @foreach ($pending as $cmd)
                                    <form method="POST" action="{{ route('commands.cancel', $cmd) }}" class="flex items-center gap-2 text-xs text-stone-600">
                                        @csrf
                                        <span>{{ $cmd->label() }} ({{ $cmd->created_at->diffForHumans() }})</span>
                                        <button class="text-red-700 hover:underline">Batalkan</button>
                                    </form>
                                @endforeach
                            </div>
                        @endif
                    </div>

                    <div class="bg-white shadow-sm rounded-xl border border-stone-100 p-5 text-sm">
                        <h3 class="font-semibold tracking-tight mb-1">Alert</h3>
                        <p class="text-stone-500 text-xs mb-3">{{ $alerts->where('handled', false)->count() }} aktif</p>
                        <div class="space-y-2">
                            @forelse ($alerts as $a)
                                <div class="rounded-lg border px-3 py-2 {{ $a->handled ? 'opacity-50 border-stone-100' : 'border-red-200 bg-red-50/50' }}">
                                    <p class="font-medium text-[13px]">{{ $a->label() }}</p>
                                    <p class="text-stone-500 text-xs">{{ $a->message }} • {{ $a->created_at->diffForHumans() }}</p>
                                    @if (! $a->handled)
                                        <form method="POST" action="{{ route('alerts.handle', $a) }}" class="mt-1">
                                            @csrf
                                            <button class="text-xs font-medium text-brand-700 hover:underline">Tandai selesai</button>
                                        </form>
                                    @endif
                                </div>
                            @empty
                                <p class="text-stone-500 text-[13px]">Tidak ada alert. Bagus.</p>
                            @endforelse
                        </div>
                    </div>
                </div>
            @else
                <div class="bg-white shadow-sm rounded-xl border border-stone-100" x-data="logPager()">
                    <div class="p-5 border-b border-stone-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 class="font-semibold tracking-tight">Linimasa aktivitas</h3>
                            <p class="text-sm text-stone-500"><span data-log-total>{{ $logs->total() }}</span> kejadian</p>
                        </div>
                        <div class="flex gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1 self-start">
                            <a data-loglink href="{{ route('devices.show', ['device' => $device->id, 'tab' => 'aktivitas']) }}"
                                class="rounded-md px-3 py-1 text-xs font-medium {{ $kind === 'semua' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500' }}">Semua</a>
                            @foreach (['app_opened' => 'App', 'foreign_window' => 'Window lain', 'command' => 'Perintah', 'online' => 'Online'] as $value => $label)
                                <a data-loglink href="{{ route('devices.show', ['device' => $device->id, 'tab' => 'aktivitas', 'jenis' => $value]) }}"
                                    class="rounded-md px-3 py-1 text-xs font-medium {{ $kind === $value ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500' }}">{{ $label }}</a>
                            @endforeach
                        </div>
                    </div>
                    <div class="p-5" id="logwrap">
                        @include('devices.partials.timeline', ['logs' => $logs])
                    </div>
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
