<?php

use App\Http\Controllers\Api\KatalogController;
use App\Http\Controllers\Api\ReaderController;
use Illuminate\Support\Facades\Route;

// Katalog publik untuk portal viewer (tanpa login, dibatasi throttle).
Route::prefix('v1/katalog')->group(function () {
    Route::get('/', [KatalogController::class, 'index'])->middleware('throttle:120,1');
    Route::get('/semua', [KatalogController::class, 'all'])->middleware('throttle:120,1');
    Route::get('/cari', [KatalogController::class, 'search'])->middleware('throttle:60,1');
});

// Akun pembaca (masuk via RFID, lalu token Bearer).
Route::prefix('v1/reader')->group(function () {
    Route::post('/login', [ReaderController::class, 'login'])->middleware('throttle:20,1');

    Route::middleware([\App\Http\Middleware\ReaderTokenAuth::class, 'throttle:120,1'])->group(function () {
        Route::post('/logout', [ReaderController::class, 'logout']);
        Route::get('/progress', [ReaderController::class, 'progress']);
        Route::post('/progress', [ReaderController::class, 'saveProgress']);
        Route::get('/lists', [ReaderController::class, 'lists']);
        Route::post('/lists', [ReaderController::class, 'storeList']);
        Route::delete('/lists/{id}', [ReaderController::class, 'destroyList']);
        Route::get('/lists/{id}', [ReaderController::class, 'listItems']);
        Route::post('/lists/{id}/items', [ReaderController::class, 'addItem']);
        Route::delete('/lists/{id}/items/{bookId}', [ReaderController::class, 'removeItem']);
        Route::get('/history', [ReaderController::class, 'history']);
        Route::post('/history', [ReaderController::class, 'logOpen']);
        Route::get('/notes', [ReaderController::class, 'notes']);
        Route::post('/notes', [ReaderController::class, 'storeNote']);
        Route::delete('/notes/{id}', [ReaderController::class, 'destroyNote']);
        Route::get('/settings', [ReaderController::class, 'settings']);
        Route::put('/settings', [ReaderController::class, 'saveSettings']);
    });
});
