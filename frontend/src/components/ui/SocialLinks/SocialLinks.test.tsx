import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mockPlatforms } from '../../../test/fixtures';
import SocialLinks from './SocialLinks';

describe('SocialLinks', () => {
    it('renders skeleton while platforms are loading', () => {
        const { container } = render(<SocialLinks isLoading platforms={[]} />);

        expect(
            screen.getByRole('navigation', { name: 'Социальные площадки загружаются' }),
        ).toHaveAttribute('aria-busy', 'true');
        expect(container.querySelectorAll('.social-link--skeleton')).toHaveLength(5);
    });

    it('renders error status when platforms failed to load', () => {
        render(<SocialLinks hasError platforms={[]} />);

        expect(screen.getByText('Площадки временно недоступны')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('hides error status in compact mode', () => {
        const { container } = render(<SocialLinks compact hasError platforms={[]} />);

        expect(
            within(container).queryByText('Площадки временно недоступны'),
        ).not.toBeInTheDocument();
        expect(within(container).queryByRole('link')).not.toBeInTheDocument();
        expect(container.querySelector('.social-links--compact')).toBeInTheDocument();
    });

    it('renders platform links from API data', () => {
        render(<SocialLinks platforms={mockPlatforms} />);

        const telegram = screen.getByRole('link', { name: 'Telegram' });
        const youtube = screen.getByRole('link', { name: 'YouTube' });

        expect(telegram).toHaveAttribute('href', 'https://t.me/dolgiy_fun');
        expect(telegram).toHaveAttribute('target', '_blank');
        expect(telegram).toHaveAttribute('rel', 'noreferrer');
        expect(telegram).toHaveTextContent('Telegram');

        expect(youtube).toHaveAttribute('href', 'https://youtube.com/@dolgiy_fun');
        expect(youtube).toHaveTextContent('YouTube');
    });

    it('hides platform names in compact mode', () => {
        const { container } = render(<SocialLinks compact platforms={mockPlatforms} />);

        const telegram = within(container).getByRole('link', { name: 'Telegram' });

        expect(telegram).toBeInTheDocument();
        expect(telegram.querySelector('span')).toBeNull();
        expect(container.querySelector('.social-links--compact')).toBeInTheDocument();
    });
});
