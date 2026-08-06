import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchDubs } from './dubs';

const mockCatalog = {
    latest: {
        id: 'latest-id',
        title: 'Latest dub',
        url: 'https://rutube.ru/video/latest-id/',
        embed_url: 'https://rutube.ru/play/embed/latest-id',
        thumbnail_url: 'https://example.com/latest.jpg',
    },
    others: [
        {
            id: 'other-id',
            title: 'Other dub',
            url: 'https://rutube.ru/video/other-id/',
            embed_url: 'https://rutube.ru/play/embed/other-id',
            thumbnail_url: null,
        },
    ],
};

describe('fetchDubs', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('returns dubs catalog from API', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockCatalog }),
        });

        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchDubs()).resolves.toEqual(mockCatalog);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/dubs', {
            headers: {
                Accept: 'application/json',
            },
            signal: undefined,
        });
    });

    it('throws when response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
            }),
        );

        await expect(fetchDubs()).rejects.toThrow('Failed to fetch dubs: 500');
    });
});
