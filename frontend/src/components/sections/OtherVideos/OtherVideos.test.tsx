import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import OtherVideos from './OtherVideos';

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

        render(<OtherVideos isLoading={false} videos={[otherVideo]} />);

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
