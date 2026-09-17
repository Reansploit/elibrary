<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\ManagerController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/enroll', [AgentController::class, 'enroll'])
        ->middleware('throttle:10,1');

    Route::middleware(['device.token', 'throttle:120,1'])->group(function () {
        Route::post('/heartbeat', [AgentController::class, 'heartbeat']);
        Route::post('/commands/{id}/ack', [AgentController::class, 'ack']);
    });

    // LUNAR Module — app guru (token Sanctum).
    Route::post('/manager/login', [ManagerController::class, 'login'])
        ->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'throttle:120,1'])->prefix('manager')->group(function () {
        Route::post('/logout', [ManagerController::class, 'logout']);
        Route::get('/devices', [ManagerController::class, 'devices']);
        Route::post('/devices/sync', [ManagerController::class, 'sync']);
        Route::get('/devices/{device}', [ManagerController::class, 'show']);
        Route::put('/devices/{device}/apps', [ManagerController::class, 'assignApps']);
        Route::patch('/devices/{device}', [ManagerController::class, 'rename']);
        Route::delete('/devices/{device}', [ManagerController::class, 'destroy']);
        Route::post('/devices/{device}/commands', [ManagerController::class, 'command']);
        Route::get('/devices/{device}/pending', [ManagerController::class, 'pending']);
        Route::post('/commands/{command}/cancel', [ManagerController::class, 'cancelCommand']);
        Route::post('/commands/{command}/result', [ManagerController::class, 'result']);
        Route::post('/alerts/{alert}/handle', [ManagerController::class, 'handleAlert']);

        Route::get('/apps', [ManagerController::class, 'apps']);
        Route::post('/apps', [ManagerController::class, 'storeApp']);
        Route::patch('/apps/{app}', [ManagerController::class, 'updateApp']);
        Route::delete('/apps/{app}', [ManagerController::class, 'destroyApp']);
    });
});
