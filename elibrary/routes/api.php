<?php

use App\Http\Controllers\Api\KatalogController;
use Illuminate\Support\Facades\Route;

// Katalog publik untuk portal viewer (tanpa login, dibatasi throttle).
Route::prefix('v1/katalog')->group(function () {
    Route::get('/', [KatalogController::class, 'index'])->middleware('throttle:120,1');
    Route::get('/semua', [KatalogController::class, 'all'])->middleware('throttle:120,1');
    Route::get('/cari', [KatalogController::class, 'search'])->middleware('throttle:60,1');
});
