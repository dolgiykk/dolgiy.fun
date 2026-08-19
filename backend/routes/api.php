<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\UserController;
use App\Http\Controllers\Api\Auth\VkLoginController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DubController;
use App\Http\Controllers\Api\LatestDubController;
use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\VideoEngagementController;
use App\Support\VideoId;
use Illuminate\Support\Facades\Route;

Route::get('/health', static fn (): array => [
    'status' => 'ok',
])->name('api.health');

Route::get('/platforms', [PlatformController::class, 'index'])->name('api.platforms.index');

Route::get('/latest-dub', [LatestDubController::class, 'show'])->name('api.latest-dub.show');

Route::get('/dubs', [DubController::class, 'index'])->name('api.dubs.index');

Route::prefix('/videos/{video}')
    ->where(['video' => VideoId::PATTERN])
    ->group(function (): void {
        Route::get('/engagement', [VideoEngagementController::class, 'show'])
            ->name('api.videos.engagement.show');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('/likes', [VideoEngagementController::class, 'like'])
                ->name('api.videos.likes.store');
            Route::delete('/likes', [VideoEngagementController::class, 'unlike'])
                ->name('api.videos.likes.destroy');
            Route::post('/comments', [VideoEngagementController::class, 'storeComment'])
                ->name('api.videos.comments.store');
        });
    });

Route::middleware('throttle:auth')->group(function (): void {
    Route::post('/register', [RegisterController::class, 'store'])->name('api.register');
    Route::post('/login', [LoginController::class, 'store'])->name('api.login');
    Route::post('/auth/vk', [VkLoginController::class, 'store'])->name('api.auth.vk');
    Route::post('/forgot-password', [PasswordResetController::class, 'store'])->name('api.password.forgot');
    Route::post('/reset-password', [PasswordResetController::class, 'update'])->name('api.password.reset');
});

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('throttle:6,1')
    ->name('api.verification.verify');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [UserController::class, 'show'])->name('api.user.show');
    Route::patch('/user', [UserController::class, 'update'])->name('api.user.update');
    Route::post('/logout', [LoginController::class, 'destroy'])->name('api.logout');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'notice'])
        ->middleware('throttle:6,1')
        ->name('api.verification.send');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])
        ->name('api.comments.destroy');
});
