<?php

namespace Database\Seeders;

use App\Models\Platform;
use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    /**
     * Seed the default public platforms.
     */
    public function run(): void
    {
        $platforms = [
            [
                'slug' => 'telegram',
                'name' => 'Telegram',
                'url' => 'https://t.me/dolgiy_fun',
                'icon' => 'telegram',
                'sort_order' => 10,
            ],
            [
                'slug' => 'rutube',
                'name' => 'RuTube',
                'url' => 'https://rutube.ru/channel/25340957',
                'icon' => 'rutube',
                'sort_order' => 20,
            ],
            [
                'slug' => 'vkvideo',
                'name' => 'VK Видео',
                'url' => 'https://vkvideo.ru/@club238840302',
                'icon' => 'vkvideo',
                'sort_order' => 30,
            ],
            [
                'slug' => 'youtube',
                'name' => 'YouTube',
                'url' => 'https://youtube.com/@dolgiy_fun',
                'icon' => 'youtube',
                'sort_order' => 40,
            ],
            [
                'slug' => 'instagram',
                'name' => 'Instagram',
                'url' => 'https://instagram.com/dolgiy.fun',
                'icon' => 'instagram',
                'sort_order' => 50,
            ],
        ];

        foreach ($platforms as $platform) {
            $model = Platform::withTrashed()->updateOrCreate(
                ['slug' => $platform['slug']],
                [
                    ...$platform,
                    'is_active' => true,
                ],
            );

            if ($model->trashed()) {
                $model->restore();
            }
        }
    }
}
