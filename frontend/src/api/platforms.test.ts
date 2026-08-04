import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchPlatforms } from './platforms';
import { mockPlatforms } from '../test/fixtures';

describe('fetchPlatforms', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('requests platforms from the API and returns data payload', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockPlatforms }),
        });

        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchPlatforms()).resolves.toEqual(mockPlatforms);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/platforms', {
            headers: {
                Accept: 'application/json',
            },
            signal: undefined,
        });
    });

    it('forwards abort signal to fetch', async () => {
        const controller = new AbortController();
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockPlatforms }),
        });

        vi.stubGlobal('fetch', fetchMock);

        await fetchPlatforms(controller.signal);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/platforms', {
            headers: {
                Accept: 'application/json',
            },
            signal: controller.signal,
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

        await expect(fetchPlatforms()).rejects.toThrow('Failed to fetch platforms: 500');
    });
});
