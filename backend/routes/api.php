<?php

use App\Http\Controllers\Api\PlatformController;
use Illuminate\Support\Facades\Route;

Route::get('/health', static fn (): array => [
    'status' => 'ok',
])->name('api.health');

Route::get('/platforms', [PlatformController::class, 'index'])->name('api.platforms.index');
