<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\BannerController;

// Auth
Route::post('/users/register', [UserController::class, 'register']);
Route::post('/users/login', [UserController::class, 'login']);

// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/send-otp', [UserController::class, 'sendVerificationOtp']);
});

// Cards
Route::post('/cards/reorder', [CardController::class, 'reorder']);
Route::apiResource('cards', CardController::class);

// Menus
Route::post('/menus/reorder', [MenuController::class, 'reorder']);
Route::apiResource('menus', MenuController::class);

// Settings
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/settings', [SettingController::class, 'update']);
// Supports bulk update if needed, but existing frontend might use singular
// Route::post('/settings/bulk', [SettingController::class, 'updateBulk']);

// Pages
// Support Image Upload First
Route::post('/pages/upload-image', [PageController::class, 'uploadImage']);
Route::apiResource('pages', PageController::class);
// Banners
Route::apiResource('banners', BannerController::class);
