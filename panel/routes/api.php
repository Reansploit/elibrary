<?php

use App\Http\Controllers\Api\AgentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/enroll', [AgentController::class, 'enroll'])
        ->middleware('throttle:10,1');

    Route::middleware(['device.token', 'throttle:120,1'])->group(function () {
        Route::post('/heartbeat', [AgentController::class, 'heartbeat']);
        Route::post('/commands/{id}/ack', [AgentController::class, 'ack']);
    });
});
