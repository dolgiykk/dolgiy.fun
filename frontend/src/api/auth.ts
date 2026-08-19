import { apiFetch, ensureCsrfCookie } from './client';
import type { AuthUser } from '../types/auth';

type UserResponse = {
    data: AuthUser;
};

type MessageResponse = {
    data: {
        message: string;
    } | null;
};

export class AuthApiError extends Error {
    status: number;
    errors: Record<string, string[]>;

    constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
        super(message);
        this.name = 'AuthApiError';
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

    throw new AuthApiError(response.status, message, errors);
}

export async function fetchCurrentUser(signal?: AbortSignal): Promise<AuthUser | null> {
    const response = await apiFetch('/user', { signal });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as UserResponse;
    return payload.data;
}

export async function registerUser(input: {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<AuthUser> {
    await ensureCsrfCookie();
    const response = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as UserResponse;
    return payload.data;
}

export async function loginWithVk(accessToken: string): Promise<AuthUser> {
    await ensureCsrfCookie();
    const response = await apiFetch('/auth/vk', {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as UserResponse;
    return payload.data;
}

export async function loginUser(input: {
    email: string;
    password: string;
    remember?: boolean;
}): Promise<AuthUser> {
    await ensureCsrfCookie();
    const response = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as UserResponse;
    return payload.data;
}

export async function logoutUser(): Promise<void> {
    await ensureCsrfCookie();
    const response = await apiFetch('/logout', { method: 'POST' });

    if (!response.ok) {
        await parseError(response);
    }
}

export async function forgotPassword(email: string): Promise<string> {
    await ensureCsrfCookie();
    const response = await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as MessageResponse;
    return payload.data?.message || 'OK';
}

export async function resetPassword(input: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<string> {
    await ensureCsrfCookie();
    const response = await apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as MessageResponse;
    return payload.data?.message || 'OK';
}

export async function updateProfile(input: { username?: string }): Promise<AuthUser> {
    await ensureCsrfCookie();
    const response = await apiFetch('/user', {
        method: 'PATCH',
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as UserResponse;
    return payload.data;
}

export async function uploadAvatar(file: File): Promise<AuthUser> {
    await ensureCsrfCookie();
    const body = new FormData();
    body.append('avatar', file);

    const response = await apiFetch('/user/avatar', {
        method: 'POST',
        body,
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as UserResponse;
    return payload.data;
}

export async function resendEmailVerification(): Promise<string> {
    await ensureCsrfCookie();
    const response = await apiFetch('/email/verification-notification', {
        method: 'POST',
    });

    if (!response.ok) {
        await parseError(response);
    }

    const payload = (await response.json()) as MessageResponse;
    return payload.data?.message || 'OK';
}
