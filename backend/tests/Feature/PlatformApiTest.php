<?php

namespace Tests\Feature;

use App\Models\Platform;
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
}
