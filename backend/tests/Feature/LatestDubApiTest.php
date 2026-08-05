<?php

namespace Tests\Feature;

use App\Services\LatestDubCache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LatestDubApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        app(LatestDubCache::class)->forget();
    }

    public function test_latest_dub_endpoint_returns_newest_classic_video(): void
    {
        Http::fake([
            'rutube.ru/api/video/person/*' => Http::response([
                'results' => [
                    [
                        'id' => 'short-video-id-1234567890123456789012',
                        'title' => 'Short demo',
                        'video_url' => 'https://rutube.ru/video/short-video-id-1234567890123456789012/',
                        'embed_url' => 'https://rutube.ru/play/embed/short-video-id-1234567890123456789012',
                        'thumbnail_url' => 'https://example.com/short.jpg',
                        'origin_type' => 'rshorts',
                    ],
                    [
                        'id' => 'classic-video-id-12345678901234567890',
                        'title' => 'Две минуты — озвучено dolgiy.fun',
                        'video_url' => 'https://rutube.ru/video/classic-video-id-12345678901234567890/',
                        'embed_url' => 'https://rutube.ru/play/embed/classic-video-id-12345678901234567890',
                        'thumbnail_url' => 'https://example.com/classic.jpg',
                        'origin_type' => 'rtb',
                    ],
                ],
            ]),
        ]);

        $this->getJson('/api/latest-dub')
            ->assertOk()
            ->assertJsonPath('data.id', 'classic-video-id-12345678901234567890')
            ->assertJsonPath('data.title', 'Две минуты — озвучено dolgiy.fun')
            ->assertJsonPath(
                'data.embed_url',
                'https://rutube.ru/play/embed/classic-video-id-12345678901234567890',
            )
            ->assertJsonPath(
                'data.url',
                'https://rutube.ru/video/classic-video-id-12345678901234567890/',
            );
    }

    public function test_latest_dub_endpoint_returns_null_data_when_rutube_is_unavailable(): void
    {
        Http::fake([
            'rutube.ru/api/video/person/*' => Http::response('unavailable', 503),
        ]);

        $this->getJson('/api/latest-dub')
            ->assertOk()
            ->assertExactJson([
                'data' => null,
            ]);
    }

    public function test_latest_dub_response_is_cached(): void
    {
        Http::fake([
            'rutube.ru/api/video/person/*' => Http::sequence()
                ->push([
                    'results' => [
                        [
                            'id' => 'first-video-id-123456789012345678901',
                            'title' => 'First',
                            'video_url' => 'https://rutube.ru/video/first-video-id-123456789012345678901/',
                            'embed_url' => 'https://rutube.ru/play/embed/first-video-id-123456789012345678901',
                            'thumbnail_url' => null,
                            'origin_type' => 'rtb',
                        ],
                    ],
                ])
                ->push([
                    'results' => [
                        [
                            'id' => 'second-video-id-12345678901234567890',
                            'title' => 'Second',
                            'video_url' => 'https://rutube.ru/video/second-video-id-12345678901234567890/',
                            'embed_url' => 'https://rutube.ru/play/embed/second-video-id-12345678901234567890',
                            'thumbnail_url' => null,
                            'origin_type' => 'rtb',
                        ],
                    ],
                ]),
        ]);

        $this->getJson('/api/latest-dub')
            ->assertOk()
            ->assertJsonPath('data.id', 'first-video-id-123456789012345678901');

        $this->getJson('/api/latest-dub')
            ->assertOk()
            ->assertJsonPath('data.id', 'first-video-id-123456789012345678901');

        Http::assertSentCount(1);
    }
}
