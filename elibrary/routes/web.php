<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\CirculationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('books', BookController::class)->except(['show']);
    Route::get('/books/management', [BookController::class, 'management'])->name('books.management');
    Route::resource('members', MemberController::class)->except(['show']);

    Route::get('/circulation', [CirculationController::class, 'index'])->name('circulation.index');
    Route::get('/circulation/overdue', [CirculationController::class, 'overdue'])->name('circulation.overdue');
    Route::get('/circulation/borrow', [CirculationController::class, 'create'])->name('circulation.create');
    Route::post('/circulation', [CirculationController::class, 'store'])->name('circulation.store');
    Route::post('/circulation/{id}/return', [CirculationController::class, 'returnBook'])->name('circulation.return');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/users', [SettingsController::class, 'storeUser'])->name('settings.users.store');
    Route::put('/settings/users/{id}', [SettingsController::class, 'updateUser'])->name('settings.users.update');
    Route::delete('/settings/users/{id}', [SettingsController::class, 'destroyUser'])->name('settings.users.destroy');

    // Roles
    Route::post('/settings/roles', [SettingsController::class, 'storeRole'])->name('settings.roles.store');
    Route::put('/settings/roles/{id}', [SettingsController::class, 'updateRole'])->name('settings.roles.update');
    Route::delete('/settings/roles/{id}', [SettingsController::class, 'destroyRole'])->name('settings.roles.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
