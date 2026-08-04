<?php

namespace App\Providers;

use App\Models\Platform;
use App\Observers\PlatformObserver;
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
    }
}
