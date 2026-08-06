<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class LatestDubCache
{
    private const CACHE_KEY = 'dubs.catalog.v1';

    /**
     * @return array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}|null
     */
    public function latest(): ?array
    {
        return $this->catalog()['latest'];
    }

    /**
     * @return array{
     *     latest: array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}|null,
     *     others: list<array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}>
     * }
     */
    public function catalog(): array
    {
        $store = $this->store();
        $ttl = max(60, (int) config('rutube.cache_ttl_seconds', 3600));

        /** @var array{latest: array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}|null, others: list<array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}>} $catalog */
        $catalog = Cache::store($store)->remember(
            self::CACHE_KEY,
            $ttl,
            fn (): array => $this->fetchCatalogFromRutube(),
        );

        return $catalog;
    }

    public function forget(): void
    {
        Cache::store($this->store())->forget(self::CACHE_KEY);
        Cache::store($this->store())->forget('latest-dub.v1');
    }

    /**
     * @return array{
     *     latest: array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}|null,
     *     others: list<array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}>
     * }
     */
    private function fetchCatalogFromRutube(): array
    {
        $channelId = (string) config('rutube.channel_id');

        if ($channelId === '') {
            throw new RuntimeException('Rutube channel id is not configured.');
        }

        try {
            $response = Http::acceptJson()
                ->timeout(8)
                ->get("https://rutube.ru/api/video/person/{$channelId}/", [
                    'page' => 1,
                    'origin__type' => 'rtb,rst,ifrm,rspa',
                ])
                ->throw()
                ->json();
        } catch (Throwable $exception) {
            report($exception);

            return [
                'latest' => null,
                'others' => [],
            ];
        }

        $results = data_get($response, 'results', []);

        if (! is_array($results) || $results === []) {
            return [
                'latest' => null,
                'others' => [],
            ];
        }

        $videos = collect($results)
            ->filter(
                static fn (mixed $item): bool => is_array($item)
                    && filled(data_get($item, 'id'))
                    && filled(data_get($item, 'embed_url'))
                    && data_get($item, 'origin_type') !== 'rshorts',
            )
            ->map(fn (array $video): array => $this->mapVideo($video))
            ->values();

        if ($videos->isEmpty()) {
            $videos = collect($results)
                ->filter(
                    static fn (mixed $item): bool => is_array($item)
                        && filled(data_get($item, 'id'))
                        && filled(data_get($item, 'embed_url')),
                )
                ->map(fn (array $video): array => $this->mapVideo($video))
                ->values();
        }

        if ($videos->isEmpty()) {
            return [
                'latest' => null,
                'others' => [],
            ];
        }

        return [
            'latest' => $videos->first(),
            'others' => $videos->slice(1)->values()->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $video
     * @return array{id: string, title: string, url: string, embed_url: string, thumbnail_url: string|null}
     */
    private function mapVideo(array $video): array
    {
        $thumbnailUrl = data_get($video, 'thumbnail_url');

        return [
            'id' => (string) data_get($video, 'id'),
            'title' => (string) data_get($video, 'title', 'Озвучка DOLGIY.FUN'),
            'url' => (string) data_get($video, 'video_url', data_get($video, 'source_url', '')),
            'embed_url' => (string) data_get($video, 'embed_url'),
            'thumbnail_url' => is_string($thumbnailUrl) ? $thumbnailUrl : null,
        ];
    }

    private function store(): string
    {
        return (string) config('rutube.cache_store', 'redis');
    }
}
