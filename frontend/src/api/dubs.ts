import type { DubsCatalog } from '../types/latestDub';

type DubsResponse = {
    data: DubsCatalog;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
    /\/$/,
    '',
);

export async function fetchDubs(signal?: AbortSignal): Promise<DubsCatalog> {
    const response = await fetch(`${API_BASE_URL}/dubs`, {
        headers: {
            Accept: 'application/json',
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch dubs: ${response.status}`);
    }

    const payload = (await response.json()) as DubsResponse;

    return {
        latest: payload.data.latest,
        others: payload.data.others ?? [],
    };
}
