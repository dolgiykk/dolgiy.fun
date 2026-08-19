import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '../../../types/auth';
import VideoModal from './VideoModal';

const video = {
    id: 'video-id',
    title: 'Тестовое видео',
    url: 'https://rutube.ru/video/video-id/',
    embed_url: 'https://rutube.ru/play/embed/video-id',
    thumbnail_url: null,
};

const authState: { user: AuthUser | null; isLoading: boolean } = {
    user: null,
    isLoading: false,
};

vi.mock('../../../auth/useAuth', () => ({
    useAuth: () => authState,
}));

vi.mock('../../../api/engagement', () => ({
    fetchVideoEngagement: vi.fn(),
    likeVideo: vi.fn(),
    unlikeVideo: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
    EngagementApiError: class EngagementApiError extends Error {},
}));

import { createComment, fetchVideoEngagement } from '../../../api/engagement';

const fetchVideoEngagementMock = vi.mocked(fetchVideoEngagement);
const createCommentMock = vi.mocked(createComment);

const loggedInUser: AuthUser = {
    id: 7,
    username: 'fan',
    display_name: null,
    email: 'fan@example.com',
    role: 'user',
    avatar_url: null,
    can_upload_avatar: true,
    email_verified_at: '2026-08-18T00:00:00.000000Z',
    needs_username: false,
};

function renderModal() {
    return render(
        <MemoryRouter>
            <VideoModal video={video} onClose={vi.fn()} />
        </MemoryRouter>,
    );
}

describe('VideoModal', () => {
    beforeEach(() => {
        authState.user = null;
        authState.isLoading = false;
        fetchVideoEngagementMock.mockReset();
        createCommentMock.mockReset();
        fetchVideoEngagementMock.mockResolvedValue({
            likes_count: 0,
            liked: false,
            comments_count: 0,
            has_more: false,
            comments: [],
        });
    });

    it('renders nothing when video is null', () => {
        const { container } = render(<VideoModal video={null} onClose={vi.fn()} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('closes on Escape and close button', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <MemoryRouter>
                <VideoModal video={video} onClose={onClose} />
            </MemoryRouter>,
        );

        expect(screen.getByRole('dialog', { name: 'Тестовое видео' })).toBeInTheDocument();
        expect(screen.getByTitle('Тестовое видео')).toHaveAttribute(
            'src',
            'https://rutube.ru/play/embed/video-id',
        );

        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('button', { name: 'Закрыть видео' }));
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('shows a registration banner for guests', async () => {
        renderModal();

        await waitFor(() => {
            expect(
                screen.getByText('Чтобы оставить комментарий, необходимо зарегистрироваться'),
            ).toBeInTheDocument();
        });

        expect(screen.getByRole('link', { name: 'Регистрация' })).toHaveAttribute(
            'href',
            '/register',
        );
        expect(screen.getByRole('link', { name: 'Войти' })).toHaveAttribute('href', '/login');
        expect(screen.getByText('0 комментариев')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Комментарий' })).not.toBeInTheDocument();
    });

    it('shows a comment form for an authenticated user', async () => {
        authState.user = loggedInUser;
        createCommentMock.mockResolvedValue({
            id: 15,
            body: 'Класс',
            created_at: '2026-08-18T10:00:00.000000Z',
            user: { id: 7, username: 'fan', display_name: null },
        });

        const user = userEvent.setup();
        renderModal();

        const textarea = await screen.findByRole('textbox', { name: 'Комментарий' });
        expect(
            screen.queryByText('Чтобы оставить комментарий, необходимо зарегистрироваться'),
        ).not.toBeInTheDocument();

        await user.type(textarea, 'Класс');
        await user.click(screen.getByRole('button', { name: 'Отправить' }));

        await waitFor(() => {
            expect(createCommentMock).toHaveBeenCalledWith('video-id', 'Класс');
        });
        expect(await screen.findByText('Класс')).toBeInTheDocument();
        expect(screen.getByText('@fan')).toBeInTheDocument();
    });

    it('loads older comments with show more', async () => {
        fetchVideoEngagementMock
            .mockResolvedValueOnce({
                likes_count: 0,
                liked: false,
                comments_count: 2,
                has_more: true,
                comments: [
                    {
                        id: 2,
                        body: 'Новый',
                        created_at: '2026-08-18T11:00:00.000000Z',
                        user: { id: 7, username: 'fan', display_name: null },
                    },
                ],
            })
            .mockResolvedValueOnce({
                likes_count: 0,
                liked: false,
                comments_count: 2,
                has_more: false,
                comments: [
                    {
                        id: 1,
                        body: 'Старый',
                        created_at: '2026-08-18T10:00:00.000000Z',
                        user: { id: 3, username: 'old', display_name: null },
                    },
                ],
            });

        const user = userEvent.setup();
        renderModal();

        expect(await screen.findByText('Новый')).toBeInTheDocument();
        expect(screen.getByText('2 комментария')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Ещё комментарии' }));

        expect(await screen.findByText('Старый')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Комментарии' })).toBeInTheDocument();
        expect(fetchVideoEngagementMock).toHaveBeenLastCalledWith('video-id', { before: 2 });
        expect(screen.queryByRole('button', { name: 'Ещё комментарии' })).not.toBeInTheDocument();
    });
});
