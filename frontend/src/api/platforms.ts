import type { Platform } from '../types/platform';

type PlatformsResponse = {
    data: Platform[];
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
    /\/$/,
    '',
);

export async function fetchPlatforms(signal?: AbortSignal): Promise<Platform[]> {
    const response = await fetch(`${API_BASE_URL}/platforms`, {
        headers: {
            Accept: 'application/json',
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch platforms: ${response.status}`);
    }

    const payload = (await response.json()) as PlatformsResponse;

    return payload.data;
}
