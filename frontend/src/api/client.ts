const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
    /\/$/,
    '',
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export function getCsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export async function ensureCsrfCookie(): Promise<void> {
    await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    });
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const csrf = getCsrfToken();
    if (csrf) {
        headers.set('X-XSRF-TOKEN', csrf);
    }

    return fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
        ...init,
        credentials: 'include',
        headers,
    });
}
