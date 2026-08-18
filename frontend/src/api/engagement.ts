import { apiFetch, ensureCsrfCookie } from './client';
import type { VideoComment, VideoEngagement } from '../types/engagement';

type EngagementResponse = {
    data: VideoEngagement;
};

type CommentResponse = {
    data: VideoComment;
};

type LikeResponse = {
    data: {
        liked: boolean;
        likes_count: number;
    };
};

export class EngagementApiError extends Error {
    status: number;
    errors: Record<string, string[]>;

    constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
        super(message);
        this.name = 'EngagementApiError';
        this.status = status;
        this.errors = errors;
    }
}

async function parseError(response: Response): Promise<never> {
    let message = `Request failed: ${response.status}`;
    let errors: Record<string, string[]> = {};

    try {
        const payload = (await response.json()) as {
            message?: string;
            errors?: Record<string, string[]>;
        };
        message = payload.message || message;
        errors = payload.errors || {};
    } catch {
        // ignore non-json
    }

    throw new EngagementApiError(response.status, message, errors);
}

export async function fetchVideoEngagement(
    videoId: string,
    options: { before?: number; limit?: number; signal?: AbortSignal } = {},
): Promise<VideoEngagement> {
    const params = new URLSearchParams();

    if (options.before) {
        params.set('before', String(options.before));
    }

    if (options.limit) {
        params.set('limit', String(options.limit));
    }

    const query = params.toString();
    const response = await apiFetch(
        `/videos/${encodeURIComponent(videoId)}/engagement${query ? `?${query}` : ''}`,
        { signal: options.signal },
    );

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as EngagementResponse;
    return payload.data;
}

export async function likeVideo(videoId: string): Promise<LikeResponse['data']> {
    await ensureCsrfCookie();
    const response = await apiFetch(`/videos/${encodeURIComponent(videoId)}/likes`, {
        method: 'POST',
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as LikeResponse;
    return payload.data;
}

export async function unlikeVideo(videoId: string): Promise<LikeResponse['data']> {
    await ensureCsrfCookie();
    const response = await apiFetch(`/videos/${encodeURIComponent(videoId)}/likes`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as LikeResponse;
    return payload.data;
}

export async function createComment(videoId: string, body: string): Promise<VideoComment> {
    await ensureCsrfCookie();
    const response = await apiFetch(`/videos/${encodeURIComponent(videoId)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as CommentResponse;
    return payload.data;
}

export async function deleteComment(commentId: number): Promise<void> {
    await ensureCsrfCookie();
    const response = await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });

    if (!response.ok) {
        await parseError(response);
    }
}
