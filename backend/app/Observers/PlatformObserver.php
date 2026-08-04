<?php

namespace App\Observers;

use App\Models\Platform;
use App\Services\PlatformCache;

class PlatformObserver
{
    public function __construct(
        private readonly PlatformCache $platformCache,
    ) {}

    public function saved(Platform $platform): void
    {
        $this->platformCache->forgetActivePlatforms();
    }

    public function deleted(Platform $platform): void
    {
        $this->platformCache->forgetActivePlatforms();
    }

    public function restored(Platform $platform): void
    {
        $this->platformCache->forgetActivePlatforms();
    }

    public function forceDeleted(Platform $platform): void
    {
        $this->platformCache->forgetActivePlatforms();
    }
}
