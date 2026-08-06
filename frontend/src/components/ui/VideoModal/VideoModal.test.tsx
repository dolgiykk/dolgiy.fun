import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import VideoModal from './VideoModal';

const video = {
    id: 'video-id',
    title: 'Тестовое видео',
    url: 'https://rutube.ru/video/video-id/',
    embed_url: 'https://rutube.ru/play/embed/video-id',
    thumbnail_url: null,
};

describe('VideoModal', () => {
    it('renders nothing when video is null', () => {
        const { container } = render(<VideoModal video={null} onClose={vi.fn()} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('closes on Escape and close button', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<VideoModal video={video} onClose={onClose} />);

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
});
