import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { mockPlatforms } from './test/fixtures';

vi.mock('./components/layout/Background/Background', () => ({
    default: () => <div data-testid="background" />,
}));

vi.mock('./api/platforms', () => ({
    fetchPlatforms: vi.fn(),
}));

vi.mock('./api/latestDub', () => ({
    fetchLatestDub: vi.fn(),
}));

import { fetchLatestDub } from './api/latestDub';
import { fetchPlatforms } from './api/platforms';

const fetchPlatformsMock = vi.mocked(fetchPlatforms);
const fetchLatestDubMock = vi.mocked(fetchLatestDub);

describe('App', () => {
    beforeEach(() => {
        fetchPlatformsMock.mockReset();
        fetchLatestDubMock.mockReset();
        fetchLatestDubMock.mockResolvedValue(null);
    });

    it('loads platforms from API and renders links in platforms section', async () => {
        fetchPlatformsMock.mockResolvedValue(mockPlatforms);

        render(<App />);

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
    });

    it('shows unavailable status when platforms request fails', async () => {
        fetchPlatformsMock.mockRejectedValue(new Error('network'));

        render(<App />);

        await waitFor(() => {
            expect(screen.getAllByText('Площадки временно недоступны').length).toBeGreaterThan(0);
        });

        expect(screen.queryByRole('link', { name: 'Telegram' })).not.toBeInTheDocument();
    });

    it('passes abort signal to platforms request', async () => {
        fetchPlatformsMock.mockResolvedValue(mockPlatforms);

        const { unmount } = render(<App />);

        expect(fetchPlatformsMock).toHaveBeenCalledWith(expect.any(AbortSignal));

        unmount();
    });
});
