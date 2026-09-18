<?php

use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('devices.index');
});

// Shell SPA LUNAR (publik, data tetap lewat API token).
Route::get('/lunar', function () {
    return response()->view('lunar')->header('Cache-Control', 'no-store');
})->name('lunar');

Route::get('/dashboard', function () {
    return redirect()->route('devices.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/perangkat', [DeviceController::class, 'index'])->name('devices.index');
    Route::get('/perangkat/{device}', [DeviceController::class, 'show'])->name('devices.show');
    Route::patch('/perangkat/{device}', [DeviceController::class, 'rename'])->name('devices.rename');
    Route::delete('/perangkat/{device}', [DeviceController::class, 'destroy'])->name('devices.destroy');
    Route::post('/perangkat/{device}/perintah', [DeviceController::class, 'command'])->name('devices.command');
    Route::post('/perintah/{command}/batal', [DeviceController::class, 'cancelCommand'])->name('commands.cancel');
    Route::post('/alert/{alert}/selesai', [DeviceController::class, 'handleAlert'])->name('alerts.handle');
});

require __DIR__.'/auth.php';
