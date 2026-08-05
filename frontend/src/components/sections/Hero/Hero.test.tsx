import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Hero from './Hero';

vi.mock('../../../api/latestDub', () => ({
    fetchLatestDub: vi.fn(),
}));

import { fetchLatestDub } from '../../../api/latestDub';

const fetchLatestDubMock = vi.mocked(fetchLatestDub);

describe('Hero', () => {
    beforeEach(() => {
        fetchLatestDubMock.mockReset();
    });

    it('renders voice-over copy and embeds the latest Rutube video', async () => {
        fetchLatestDubMock.mockResolvedValue({
            id: 'e4bca09605bc08619d9f75b17e95a45c',
            title: 'Две минуты — озвучено dolgiy.fun',
            url: 'https://rutube.ru/video/e4bca09605bc08619d9f75b17e95a45c/',
            embed_url: 'https://rutube.ru/play/embed/e4bca09605bc08619d9f75b17e95a45c',
            thumbnail_url: null,
        });

        render(<Hero />);

        expect(screen.getByText('Русский голос поверх оригинала')).toBeInTheDocument();
        expect(screen.getByText('OVER ORIGINAL')).toBeInTheDocument();
        expect(screen.getByText(/русский голос поверх оригинальной дорожки/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTitle('Две минуты — озвучено dolgiy.fun')).toBeInTheDocument();
        });

        expect(screen.getByText('Самая свежая озвучка')).toBeInTheDocument();
        expect(screen.getByTitle('Две минуты — озвучено dolgiy.fun')).toHaveAttribute(
            'src',
            'https://rutube.ru/play/embed/e4bca09605bc08619d9f75b17e95a45c',
        );
    });

    it('keeps the waveform fallback when latest dub is unavailable', async () => {
        fetchLatestDubMock.mockResolvedValue(null);

        const { container } = render(<Hero />);

        await waitFor(() => {
            expect(fetchLatestDubMock).toHaveBeenCalled();
        });

        expect(screen.getByText('dub session')).toBeInTheDocument();
        expect(screen.getByText('DOLGIY.FUN')).toBeInTheDocument();
        expect(container.querySelector('.hero__waveform')).toBeInTheDocument();
        expect(screen.queryByTitle(/озвучено/i)).not.toBeInTheDocument();
    });
});
