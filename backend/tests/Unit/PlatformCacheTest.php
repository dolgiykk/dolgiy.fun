<?php

namespace Tests\Unit;

use App\Models\Platform;
use App\Services\PlatformCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PlatformCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_platforms_are_cached_as_plain_arrays(): void
    {
        Platform::query()->create([
            'slug' => 'telegram',
            'name' => 'Telegram',
            'url' => 'https://t.me/dolgiy_fun',
            'icon' => 'telegram',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $cache = app(PlatformCache::class);
        $platforms = $cache->activePlatforms();

        $this->assertIsArray($platforms);
        $this->assertCount(1, $platforms);
        $this->assertSame('telegram', $platforms[0]['slug']);
        $this->assertSame('https://t.me/dolgiy_fun', $platforms[0]['url']);
        $this->assertTrue($platforms[0]['is_active']);

        $store = (string) config('platforms.cache_store', 'array');
        $cached = Cache::store($store)->get('platforms.active.v2');

        $this->assertIsArray($cached);
        $this->assertSame($platforms, $cached);
    }

    public function test_active_platforms_are_served_from_cache_on_subsequent_calls(): void
    {
        Platform::query()->create([
            'slug' => 'youtube',
            'name' => 'YouTube',
            'url' => 'https://youtube.com/@dolgiy_fun',
            'icon' => 'youtube',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $cache = app(PlatformCache::class);

        $first = $cache->activePlatforms();

        Platform::withoutEvents(
            static fn (): bool => Platform::query()->where('slug', 'youtube')->update([
                'name' => 'YouTube Changed Without Cache Bust',
            ]),
        );

        $second = $cache->activePlatforms();

        $this->assertSame($first, $second);
        $this->assertSame('YouTube', $second[0]['name']);
    }

    public function test_forget_active_platforms_clears_cache_key(): void
    {
        Platform::query()->create([
            'slug' => 'instagram',
            'name' => 'Instagram',
            'url' => 'https://instagram.com/dolgiy.fun',
            'icon' => 'instagram',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $cache = app(PlatformCache::class);
        $cache->activePlatforms();

        $store = (string) config('platforms.cache_store', 'array');

        $this->assertTrue(Cache::store($store)->has('platforms.active.v2'));

        $cache->forgetActivePlatforms();

        $this->assertFalse(Cache::store($store)->has('platforms.active.v2'));
    }
}
