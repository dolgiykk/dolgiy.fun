import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import OtherVideos from './OtherVideos';

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

const otherVideo = {
    id: 'other-id',
    title: 'Стрелок — озвучено dolgiy.fun',
    url: 'https://rutube.ru/video/other-id/',
    embed_url: 'https://rutube.ru/play/embed/other-id',
    thumbnail_url: 'https://example.com/gun.jpg',
};

describe('OtherVideos', () => {
    it('renders other videos and opens popup player', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <OtherVideos isLoading={false} videos={[otherVideo]} />
            </MemoryRouter>,
        );

        expect(
            screen.getByRole('button', { name: /Смотреть: Стрелок — озвучено dolgiy.fun/i }),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: /Смотреть: Стрелок — озвучено dolgiy.fun/i }),
        );

        expect(
            screen.getByRole('dialog', { name: /Стрелок — озвучено dolgiy.fun/i }),
        ).toBeInTheDocument();
        expect(screen.getByTitle('Стрелок — озвучено dolgiy.fun')).toHaveAttribute(
            'src',
            'https://rutube.ru/play/embed/other-id',
        );

        await user.click(screen.getByRole('button', { name: 'Закрыть видео' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('hides the section when there are no other videos', () => {
        const { container } = render(<OtherVideos isLoading={false} videos={[]} />);

        expect(container).toBeEmptyDOMElement();
    });
});
