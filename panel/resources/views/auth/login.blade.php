<x-guest-layout>
    <div class="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        <div class="hidden lg:block rounded-2xl bg-gradient-to-br from-brand-50 via-white to-white border border-brand-100 p-8">
            <img src="/images/logo-wbs.png" alt="Logo" class="h-14 w-14 object-contain" />
            <h2 class="mt-4 text-xl font-bold tracking-tight text-stone-900">Panel kontrol perangkat perpus</h2>
            <ul class="mt-4 space-y-3 text-sm text-stone-600">
                <li class="flex gap-2"><span class="text-brand-600 font-bold">✓</span> Pantau status tiap PC secara live</li>
                <li class="flex gap-2"><span class="text-brand-600 font-bold">✓</span> Buka / tutup app dari jarak jauh</li>
                <li class="flex gap-2"><span class="text-brand-600 font-bold">✓</span> Alert otomatis + linimasa aktivitas</li>
            </ul>
        </div>

        <div>
            <h1 class="text-xl font-bold tracking-tight text-stone-900">Masuk Panel</h1>
            <p class="mt-1 text-sm text-stone-500 mb-6">Khusus guru pengelola perangkat</p>

            <x-auth-session-status class="mb-4" :status="session('status')" />

            <form method="POST" action="{{ route('login') }}" class="space-y-4">
                @csrf

                <div>
                    <x-input-label for="email" :value="__('Email')" />
                    <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
                    <x-input-error :messages="$errors->get('email')" class="mt-2" />
                </div>

                <div>
                    <x-input-label for="password" :value="__('Password')" />

                    <x-text-input id="password" class="block mt-1 w-full"
                                    type="password"
                                    name="password"
                                    required autocomplete="current-password" />

                    <x-input-error :messages="$errors->get('password')" class="mt-2" />
                </div>

                <div class="block">
                    <label for="remember_me" class="inline-flex items-center">
                        <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-brand-600 shadow-sm focus:ring-brand-600" name="remember">
                        <span class="ms-2 text-sm text-gray-600">{{ __('Remember me') }}</span>
                    </label>
                </div>

                <div class="flex items-center justify-end">
                    @if (Route::has('password.request'))
                        <a class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600" href="{{ route('password.request') }}">
                            {{ __('Forgot your password?') }}
                        </a>
                    @endif

                    <x-primary-button class="ms-3">
                        {{ __('Log in') }}
                    </x-primary-button>
                </div>
            </form>
        </div>
    </div>
</x-guest-layout>
