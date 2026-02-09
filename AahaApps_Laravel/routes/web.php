<?php

use Illuminate\Support\Facades\Route;

Route::any('/{any}', function () {
    return response()->file(public_path('index.html'));
})->where('any', '.*');
