<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\CirculationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EksemplarController;
use App\Http\Controllers\KatalogController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\LokasiController;
use App\Http\Controllers\OpnameController;
use App\Http\Controllers\ReservasiController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SanksiController;
use App\Http\Controllers\SearchController;
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

// Katalog publik (tanpa login)
Route::get('/katalog', [KatalogController::class, 'index'])->name('katalog');
Route::get('/katalog/semua', [KatalogController::class, 'all'])->name('katalog.all');
Route::get('/katalog/search', [KatalogController::class, 'search'])
    ->middleware('throttle:60,1')
    ->name('katalog.search');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('books', BookController::class)->except(['show']);
    Route::get('/books/management', [BookController::class, 'management'])->name('books.management');
    Route::get('/books/{id}', [BookController::class, 'show'])->name('books.show');
    Route::post('/books/{id}/exemplars', [EksemplarController::class, 'store'])->name('exemplars.store');
    Route::put('/exemplars/{id}', [EksemplarController::class, 'update'])->name('exemplars.update');
    Route::delete('/exemplars/{id}', [EksemplarController::class, 'destroy'])->name('exemplars.destroy');
    Route::resource('members', MemberController::class)->except(['show']);
    Route::get('/members/promote', [MemberController::class, 'promote'])->name('members.promote');
    Route::post('/members/promote', [MemberController::class, 'promoteBatch'])->name('members.promoteBatch');
    Route::post('/members/graduate', [MemberController::class, 'graduateBatch'])->name('members.graduateBatch');
    Route::post('/members/{id}/reactivate', [MemberController::class, 'reactivate'])->name('members.reactivate');
    Route::get('/members/{id}', [MemberController::class, 'show'])->name('members.show');

    Route::resource('lokasi', LokasiController::class)->except(['show']);

    Route::get('/opname', [OpnameController::class, 'index'])->name('opname.index');
    Route::post('/opname', [OpnameController::class, 'finish'])->name('opname.finish');

    Route::get('/reservasi', [ReservasiController::class, 'index'])->name('reservasi.index');
    Route::post('/reservasi', [ReservasiController::class, 'store'])->name('reservasi.store');
    Route::post('/reservasi/{id}/batal', [ReservasiController::class, 'batal'])->name('reservasi.batal');
    Route::post('/reservasi/{id}/selesai', [ReservasiController::class, 'selesai'])->name('reservasi.selesai');

    Route::get('/sanksi', [SanksiController::class, 'index'])->name('sanksi.index');
    Route::put('/sanksi/{id}', [SanksiController::class, 'update'])->name('sanksi.update');

    Route::get('/search', [SearchController::class, 'index'])->name('search.index');

    Route::get('/panduan', [GuideController::class, 'index'])->name('panduan');

    Route::get('/log', [LogController::class, 'index'])->name('log.index');

    Route::get('/import', [ImportController::class, 'index'])->name('import.index');
    Route::get('/import/template/{type}', [ImportController::class, 'template'])->name('import.template');
    Route::post('/import/preview/{type}', [ImportController::class, 'preview'])->name('import.preview');
    Route::post('/import/store/{type}', [ImportController::class, 'store'])->name('import.store');

    Route::get('/laporan', [ReportController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/export', [ReportController::class, 'export'])->name('laporan.export');

    Route::get('/circulation', [CirculationController::class, 'index'])->name('circulation.index');
    Route::get('/circulation/overdue', [CirculationController::class, 'overdue'])->name('circulation.overdue');
    Route::get('/circulation/borrow', [CirculationController::class, 'create'])->name('circulation.create');
    Route::post('/circulation', [CirculationController::class, 'store'])->name('circulation.store');
    Route::post('/circulation/{id}/return', [CirculationController::class, 'returnBook'])->name('circulation.return');
    Route::post('/circulation/{id}/extend', [CirculationController::class, 'extend'])->name('circulation.extend');

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
