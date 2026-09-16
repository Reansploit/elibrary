@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge(['class' => 'border-stone-300 focus:border-brand-600 focus:ring-brand-600 rounded-lg shadow-sm']) }}>
