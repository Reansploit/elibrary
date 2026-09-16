@forelse ($logs as $l)
    <div class="relative pl-7 pb-5 last:pb-0">
        <span class="absolute left-1 top-1.5 h-2.5 w-2.5 rounded-full
            @if ($l->kind === 'app_opened') bg-emerald-500
            @elseif ($l->kind === 'app_closed') bg-stone-300
            @elseif ($l->kind === 'foreign_window') bg-amber-500
            @elseif ($l->kind === 'command') bg-sky-500
            @else bg-stone-300 @endif"></span>
        @if (! $loop->last)
            <span class="absolute left-[8px] top-6 bottom-0 w-px bg-stone-200"></span>
        @endif
        <p class="text-sm font-medium text-stone-900">{{ $l->label() }}</p>
        <p class="text-xs text-stone-500">{{ $l->detail ?? '' }} {{ $l->detail ? '•' : '' }} {{ $l->created_at->format('d/m/Y H:i') }}</p>
    </div>
@empty
    <p class="text-sm text-stone-500 text-center py-6">Belum ada aktivitas pada filter ini.</p>
@endforelse
<div class="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="[&>nav]:inline-block">
        {{ $logs->links() }}
    </div>
    @if ($logs->lastPage() > 1)
        <form data-logjump data-base="{{ route('devices.show', $device->id) }}" data-kind="{{ $kind ?? 'semua' }}" class="flex items-center gap-2 text-xs text-stone-500">
            <label for="logpage">Ke halaman</label>
            <input id="logpage" name="page" type="number" min="1" max="{{ $logs->lastPage() }}" value="{{ $logs->currentPage() }}"
                class="h-8 w-16 rounded-lg border-stone-200 text-xs shadow-sm focus:border-brand-600 focus:ring-brand-600">
            <span>/ {{ $logs->lastPage() }}</span>
            <button class="h-8 rounded-lg bg-stone-900 px-3 text-xs font-medium text-white">Loncat</button>
        </form>
    @endif
</div>
