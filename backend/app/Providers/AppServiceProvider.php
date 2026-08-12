<?php

namespace App\Providers;

use App\Models\Platform;
use App\Observers\PlatformObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Platform::observe(PlatformObserver::class);

        RateLimiter::for('auth', static function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
