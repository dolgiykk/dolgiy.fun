import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Hero from './Hero';

vi.mock('../../../auth/useAuth', () => ({
    useAuth: () => ({ user: null, isLoading: false }),
}));

vi.mock('../../../api/engagement', () => ({
    fetchVideoEngagement: vi.fn().mockResolvedValue({
        likes_count: 0,
        liked: false,
        comments_count: 0,
        has_more: false,
        comments: [],
    }),
    likeVideo: vi.fn(),
    unlikeVideo: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
    EngagementApiError: class EngagementApiError extends Error {},
}));

const latestDub = {
    id: 'e4bca09605bc08619d9f75b17e95a45c',
    title: 'Две минуты — озвучено dolgiy.fun',
    url: 'https://rutube.ru/video/e4bca09605bc08619d9f75b17e95a45c/',
    embed_url: 'https://rutube.ru/play/embed/e4bca09605bc08619d9f75b17e95a45c',
    thumbnail_url: 'https://example.com/thumb.jpg',
};

describe('Hero', () => {
    it('renders voice-over copy and opens the latest video in a popup', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Hero isLoading={false} latestDub={latestDub} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Русский голос поверх оригинала')).toBeInTheDocument();
        expect(screen.getByText('OVER ORIGINAL')).toBeInTheDocument();
        expect(screen.getByText(/русский голос поверх оригинальной дорожки/i)).toBeInTheDocument();
        expect(screen.getByText('Самая свежая озвучка')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Смотреть: Две минуты — озвучено dolgiy.fun/i }),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: /Смотреть: Две минуты — озвучено dolgiy.fun/i }),
        );

        expect(
            screen.getByRole('dialog', { name: /Две минуты — озвучено dolgiy.fun/i }),
        ).toBeInTheDocument();
        expect(screen.getByTitle('Две минуты — озвучено dolgiy.fun')).toHaveAttribute(
            'src',
            'https://rutube.ru/play/embed/e4bca09605bc08619d9f75b17e95a45c',
        );
    });

    it('keeps the waveform fallback when latest dub is unavailable', () => {
        const { container } = render(<Hero isLoading={false} latestDub={null} />);

        expect(screen.getByText('dub session')).toBeInTheDocument();
        expect(screen.getByText('DOLGIY.FUN')).toBeInTheDocument();
        expect(container.querySelector('.hero__waveform')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
