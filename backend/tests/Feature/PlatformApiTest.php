<?php

namespace Tests\Feature;

use App\Models\Platform;
use Database\Seeders\PlatformSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_platforms_endpoint_returns_active_platforms_in_sort_order(): void
    {
        Platform::query()->create([
            'slug' => 'youtube',
            'name' => 'YouTube',
            'url' => 'https://youtube.com/@dolgiy_fun',
            'icon' => 'youtube',
            'is_active' => true,
            'sort_order' => 20,
        ]);

        Platform::query()->create([
            'slug' => 'telegram',
            'name' => 'Telegram',
            'url' => 'https://t.me/dolgiy_fun',
            'icon' => 'telegram',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        Platform::query()->create([
            'slug' => 'instagram',
            'name' => 'Instagram',
            'url' => 'https://instagram.com/dolgiy.fun',
            'icon' => 'instagram',
            'is_active' => false,
            'sort_order' => 30,
        ]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'telegram')
            ->assertJsonPath('data.0.url', 'https://t.me/dolgiy_fun')
            ->assertJsonPath('data.0.icon', 'telegram')
            ->assertJsonPath('data.0.is_active', true)
            ->assertJsonPath('data.0.sort_order', 10)
            ->assertJsonPath('data.1.slug', 'youtube')
            ->assertJsonMissing([
                'slug' => 'instagram',
            ]);
    }

    public function test_platforms_endpoint_does_not_return_soft_deleted_platforms(): void
    {
        Platform::query()->create([
            'slug' => 'rutube',
            'name' => 'RuTube',
            'url' => 'https://rutube.ru/channel/25340957',
            'icon' => 'rutube',
            'is_active' => true,
            'sort_order' => 10,
        ])->delete();

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_platforms_endpoint_returns_seeded_default_platforms(): void
    {
        $this->seed(PlatformSeeder::class);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.slug', 'telegram')
            ->assertJsonPath('data.0.url', 'https://t.me/dolgiy_fun')
            ->assertJsonPath('data.1.slug', 'rutube')
            ->assertJsonPath('data.1.url', 'https://rutube.ru/channel/25340957')
            ->assertJsonPath('data.2.slug', 'vkvideo')
            ->assertJsonPath('data.2.url', 'https://vkvideo.ru/@club238840302')
            ->assertJsonPath('data.3.slug', 'youtube')
            ->assertJsonPath('data.3.url', 'https://youtube.com/@dolgiy_fun')
            ->assertJsonPath('data.4.slug', 'instagram')
            ->assertJsonPath('data.4.url', 'https://instagram.com/dolgiy.fun');
    }

    public function test_platforms_cache_is_invalidated_when_platform_changes(): void
    {
        $platform = Platform::query()->create([
            'slug' => 'telegram',
            'name' => 'Telegram',
            'url' => 'https://t.me/dolgiy_fun',
            'icon' => 'telegram',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Telegram');

        Platform::withoutEvents(
            static fn (): bool => $platform->update([
                'name' => 'Telegram Without Events',
            ]),
        );

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Telegram');

        $platform->update([
            'name' => 'Telegram Updated',
        ]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Telegram Updated');
    }

    public function test_platforms_cache_is_invalidated_when_platform_is_deactivated(): void
    {
        $platform = Platform::query()->create([
            'slug' => 'telegram',
            'name' => 'Telegram',
            'url' => 'https://t.me/dolgiy_fun',
            'icon' => 'telegram',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $platform->update([
            'is_active' => false,
        ]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_platforms_cache_is_invalidated_when_platform_is_soft_deleted(): void
    {
        $platform = Platform::query()->create([
            'slug' => 'youtube',
            'name' => 'YouTube',
            'url' => 'https://youtube.com/@dolgiy_fun',
            'icon' => 'youtube',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $platform->delete();

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_platforms_cache_is_invalidated_when_platform_is_restored(): void
    {
        $platform = Platform::query()->create([
            'slug' => 'vkvideo',
            'name' => 'VK Видео',
            'url' => 'https://vkvideo.ru/@club238840302',
            'icon' => 'vkvideo',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $platform->delete();

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $platform->restore();

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'vkvideo');
    }
}
