<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Minimal auth API routes used by tests and early development.
Route::middleware('api')->prefix('api/auth')->group(function () {
    Route::post('/register', [\App\Http\Controllers\Api\Auth\RegisterController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\Api\Auth\LoginController::class, 'login']);
    Route::post('/forgot-password', function () { return response()->json(['message' => 'not implemented'], 501); });
    Route::post('/reset-password', function () { return response()->json(['message' => 'not implemented'], 501); });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\Auth\LoginController::class, 'logout']);
        Route::post('/logout-all', [\App\Http\Controllers\Api\Auth\LoginController::class, 'logoutAll']);
        Route::get('/me', [\App\Http\Controllers\Api\Auth\ProfileController::class, 'me']);
        Route::put('/me', [\App\Http\Controllers\Api\Auth\ProfileController::class, 'update']);
        Route::put('/me/password', [\App\Http\Controllers\Api\Auth\ProfileController::class, 'changePassword']);
    });
});

// Public product routes (also expose under web routes for test/dev convenience)
Route::middleware('api')->prefix('api/products')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\Product\ProductController::class, 'index']);
    Route::get('/{slug}', [\App\Http\Controllers\Api\Product\ProductController::class, 'show']);
});
