<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Perangkat Perpustakaan
        </h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            @if (session('success'))
                <div class="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-white overflow-hidden shadow-sm rounded-lg p-5">
                    <p class="text-xs text-gray-500">Total PC</p>
                    <p class="text-2xl font-bold">{{ $stats['total'] }}</p>
                </div>
                <div class="bg-white overflow-hidden shadow-sm rounded-lg p-5">
                    <p class="text-xs text-gray-500">Online</p>
                    <p class="text-2xl font-bold text-emerald-600">{{ $stats['online'] }}</p>
                </div>
                <div class="bg-white overflow-hidden shadow-sm rounded-lg p-5">
                    <p class="text-xs text-gray-500">App terbuka</p>
                    <p class="text-2xl font-bold text-sky-600">{{ $stats['app_open'] }}</p>
                </div>
                <div class="bg-white overflow-hidden shadow-sm rounded-lg p-5">
                    <p class="text-xs text-gray-500">Perlu perhatian</p>
                    <p class="text-2xl font-bold {{ $stats['alerts'] > 0 ? 'text-red-600' : '' }}">{{ $stats['alerts'] }}</p>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                <div class="p-5 border-b">
                    <h3 class="font-semibold">Daftar PC</h3>
                    <p class="text-sm text-gray-500">Klik nama untuk detail, log, dan perintah remote</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">Nama</th>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">MAC / IP</th>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">App</th>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">Terakhir lapor</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @forelse ($devices as $d)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-2">
                                        <a href="{{ route('devices.show', $d) }}" class="font-medium text-orange-700 hover:underline">
                                            {{ $d->displayName() }}
                                        </a>
                                        @if ($d->unhandled_alerts > 0)
                                            <span class="ml-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                                {{ $d->unhandled_alerts }}
                                            </span>
                                        @endif
                                        <div class="text-xs text-gray-400 font-mono">{{ $d->hostname }}</div>
                                    </td>
                                    <td class="px-4 py-2 font-mono text-xs">
                                        {{ $d->mac }}<br>
                                        <span class="text-gray-400">{{ $d->ip ?? '-' }}</span>
                                    </td>
                                    <td class="px-4 py-2">
                                        @if ($d->isOnline())
                                            <span class="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Online</span>
                                        @else
                                            <span class="inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">Offline</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-2">
                                        @if ($d->app_open)
                                            <span class="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">Terbuka</span>
                                        @else
                                            <span class="inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">Tertutup</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-2 text-gray-500">
                                        {{ $d->last_seen_at ? $d->last_seen_at->diffForHumans() : 'Belum pernah' }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                                        Belum ada PC terdaftar. Buka app di PC perpus sekali untuk mendaftarkan otomatis.
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
