<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ $device->displayName() }}
            </h2>
            <a href="{{ route('devices.index') }}" class="text-sm text-orange-700 hover:underline">← Kembali</a>
        </div>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            @if (session('success'))
                <div class="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif
            @if ($errors->any())
                <div class="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
                    {{ $errors->first() }}
                </div>
            @endif

            <div class="grid gap-4 lg:grid-cols-3">
                <div class="bg-white shadow-sm rounded-lg p-5 space-y-2 text-sm">
                    <h3 class="font-semibold mb-2">Info perangkat</h3>
                    <p><span class="text-gray-500">Hostname:</span> <span class="font-mono">{{ $device->hostname }}</span></p>
                    <p><span class="text-gray-500">MAC:</span> <span class="font-mono">{{ $device->mac }}</span></p>
                    <p><span class="text-gray-500">IP:</span> <span class="font-mono">{{ $device->ip ?? '-' }}</span></p>
                    <p><span class="text-gray-500">Agen:</span> v{{ $device->agent_version ?? '-' }}</p>
                    <p><span class="text-gray-500">Window aktif:</span> {{ $device->active_title ?? '-' }}</p>
                    <form method="POST" action="{{ route('devices.rename', $device) }}" class="flex gap-2 pt-2">
                        @csrf
                        @method('PATCH')
                        <input type="text" name="custom_name" value="{{ $device->custom_name }}" placeholder="Nama baru (kosongkan = hostname)"
                            class="flex-1 rounded-md border-gray-300 shadow-sm text-sm focus:border-orange-500 focus:ring-orange-500">
                        <button class="rounded-md bg-gray-800 text-white px-3 py-2 text-sm">Rename</button>
                    </form>
                </div>

                <div class="bg-white shadow-sm rounded-lg p-5 space-y-2 text-sm">
                    <h3 class="font-semibold mb-2">Perintah remote</h3>
                    <p class="text-gray-500 text-xs">Dijalankan agen saat lapor berikutnya (tanpa hotkey).</p>
                    <div class="flex flex-wrap gap-2">
                        <form method="POST" action="{{ route('devices.command', $device) }}">
                            @csrf
                            <input type="hidden" name="action" value="open_app">
                            <button class="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm">Buka app</button>
                        </form>
                        <form method="POST" action="{{ route('devices.command', $device) }}">
                            @csrf
                            <input type="hidden" name="action" value="close_app">
                            <button class="rounded-md bg-red-600 text-white px-3 py-2 text-sm">Tutup app</button>
                        </form>
                        <form method="POST" action="{{ route('devices.command', $device) }}">
                            @csrf
                            <input type="hidden" name="action" value="restart_agent">
                            <button class="rounded-md bg-gray-600 text-white px-3 py-2 text-sm">Restart agen</button>
                        </form>
                    </div>
                    @if ($pending->count())
                        <p class="text-xs text-amber-700 pt-1">Menunggu dijalankan: {{ $pending->pluck('action')->join(', ') }}</p>
                    @endif
                </div>

                <div class="bg-white shadow-sm rounded-lg p-5 text-sm">
                    <h3 class="font-semibold mb-2">Alert ({{ $alerts->where('handled', false)->count() }} aktif)</h3>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                        @forelse ($alerts as $a)
                            <div class="rounded-lg border px-3 py-2 {{ $a->handled ? 'opacity-50' : 'border-red-200 bg-red-50' }}">
                                <p class="font-medium">{{ $a->label() }}</p>
                                <p class="text-gray-600 text-xs">{{ $a->message }} • {{ $a->created_at->diffForHumans() }}</p>
                                @if (! $a->handled)
                                    <form method="POST" action="{{ route('alerts.handle', $a) }}" class="mt-1">
                                        @csrf
                                        <button class="text-xs text-orange-700 hover:underline">Tandai selesai</button>
                                    </form>
                                @endif
                            </div>
                        @empty
                            <p class="text-gray-500">Tidak ada alert.</p>
                        @endforelse
                    </div>
                </div>
            </div>

            <div class="bg-white shadow-sm rounded-lg">
                <div class="p-5 border-b">
                    <h3 class="font-semibold">Activity log</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">Waktu</th>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">Kejadian</th>
                                <th class="px-4 py-2 text-left font-medium text-gray-500">Detail</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @forelse ($device->logs as $l)
                                <tr>
                                    <td class="px-4 py-2 text-gray-500 whitespace-nowrap">{{ $l->created_at->format('d/m/Y H:i') }}</td>
                                    <td class="px-4 py-2 font-medium">{{ $l->label() }}</td>
                                    <td class="px-4 py-2 text-gray-600">{{ $l->detail ?? '-' }}</td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Belum ada aktivitas.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
