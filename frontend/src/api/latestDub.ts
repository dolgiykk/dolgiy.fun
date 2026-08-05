import type { LatestDub } from '../types/latestDub';

type LatestDubResponse = {
    data: LatestDub | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
    /\/$/,
    '',
);

export async function fetchLatestDub(signal?: AbortSignal): Promise<LatestDub | null> {
    const response = await fetch(`${API_BASE_URL}/latest-dub`, {
        headers: {
            Accept: 'application/json',
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch latest dub: ${response.status}`);
    }

    const payload = (await response.json()) as LatestDubResponse;

    return payload.data;
}
