<?php

namespace App\Services;

use App\Models\Platform;
use Illuminate\Support\Facades\Cache;

class PlatformCache
{
    private const ACTIVE_PLATFORMS_KEY = 'platforms.active.v2';

    /**
     * @return array<int, array<string, bool|int|string|null>>
     */
    public function activePlatforms(): array
    {
        $store = $this->store();

        /** @var array<int, array<string, bool|int|string|null>> $platforms */
        $platforms = Cache::store($store)->rememberForever(
            self::ACTIVE_PLATFORMS_KEY,
            function (): array {
                $platforms = Platform::query()
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->get();

                $payload = $platforms
                    ->map(static fn (Platform $platform): array => [
                        'id' => $platform->id,
                        'slug' => $platform->slug,
                        'name' => $platform->name,
                        'url' => $platform->url,
                        'icon' => $platform->icon,
                        'is_active' => $platform->is_active,
                        'sort_order' => $platform->sort_order,
                    ])
                    ->values()
                    ->all();

                return $payload;
            },
        );

        return $platforms;
    }

    public function forgetActivePlatforms(): void
    {
        Cache::store($this->store())->forget(self::ACTIVE_PLATFORMS_KEY);
    }

    private function store(): string
    {
        return (string) config('platforms.cache_store', 'redis');
    }
}
