import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { mockPlatforms } from './test/fixtures';

vi.mock('./components/layout/Background/Background', () => ({
    default: () => <div data-testid="background" />,
}));

vi.mock('./api/platforms', () => ({
    fetchPlatforms: vi.fn(),
}));

vi.mock('./api/dubs', () => ({
    fetchDubs: vi.fn(),
}));

vi.mock('./api/auth', () => ({
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    registerUser: vi.fn(),
    updateProfile: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    AuthApiError: class AuthApiError extends Error {},
}));

import { fetchDubs } from './api/dubs';
import { fetchPlatforms } from './api/platforms';

const fetchPlatformsMock = vi.mocked(fetchPlatforms);
const fetchDubsMock = vi.mocked(fetchDubs);

function renderApp() {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </MemoryRouter>,
    );
}

describe('App', () => {
    beforeEach(() => {
        fetchPlatformsMock.mockReset();
        fetchDubsMock.mockReset();
        fetchDubsMock.mockResolvedValue({ latest: null, others: [] });
    });

    it('loads platforms from API and renders links in platforms section', async () => {
        fetchPlatformsMock.mockResolvedValue(mockPlatforms);

        renderApp();

        expect(
            screen.getAllByRole('navigation', { name: 'Социальные площадки загружаются' }),
        ).not.toHaveLength(0);

        await waitFor(() => {
            expect(screen.getAllByRole('link', { name: 'Telegram' }).length).toBeGreaterThan(0);
        });

        const platformsSection = screen
            .getByRole('heading', {
                name: /Следите за новыми озвучками/i,
            })
            .closest('section');

        expect(platformsSection).not.toBeNull();
        expect(
            within(platformsSection as HTMLElement).getByRole('link', { name: 'Telegram' }),
        ).toHaveAttribute('href', 'https://t.me/dolgiy_fun');
        expect(fetchPlatformsMock).toHaveBeenCalledTimes(1);
        expect(fetchDubsMock).toHaveBeenCalledTimes(1);
    });

    it('shows unavailable status when platforms request fails', async () => {
        fetchPlatformsMock.mockRejectedValue(new Error('network'));

        renderApp();

        await waitFor(() => {
            expect(screen.getAllByText('Площадки временно недоступны').length).toBeGreaterThan(0);
        });

        expect(screen.queryByRole('link', { name: 'Telegram' })).not.toBeInTheDocument();
    });

    it('passes abort signal to platforms request', async () => {
        fetchPlatformsMock.mockResolvedValue(mockPlatforms);

        const { unmount } = renderApp();

        expect(fetchPlatformsMock).toHaveBeenCalledWith(expect.any(AbortSignal));

        unmount();
    });
});
