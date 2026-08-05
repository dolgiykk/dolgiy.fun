import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchLatestDub } from './latestDub';

const mockLatestDub = {
    id: 'e4bca09605bc08619d9f75b17e95a45c',
    title: 'Две минуты — озвучено dolgiy.fun',
    url: 'https://rutube.ru/video/e4bca09605bc08619d9f75b17e95a45c/',
    embed_url: 'https://rutube.ru/play/embed/e4bca09605bc08619d9f75b17e95a45c',
    thumbnail_url: 'https://example.com/thumb.jpg',
};

describe('fetchLatestDub', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('returns latest dub payload from API', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockLatestDub }),
        });

        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchLatestDub()).resolves.toEqual(mockLatestDub);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/latest-dub', {
            headers: {
                Accept: 'application/json',
            },
            signal: undefined,
        });
    });

    it('returns null when API has no featured video', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ data: null }),
            }),
        );

        await expect(fetchLatestDub()).resolves.toBeNull();
    });

    it('throws when response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 502,
            }),
        );

        await expect(fetchLatestDub()).rejects.toThrow('Failed to fetch latest dub: 502');
    });
});
