import './SocialLinks.css';

import { fallbackPlatformIcon, platformIcons } from '../../../data/social.tsx';
import type { Platform } from '../../../types/platform';

type Props = {
    compact?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    platforms: Platform[];
};

const skeletonItems = ['one', 'two', 'three', 'four', 'five'];

export default function SocialLinks({
    compact = false,
    hasError = false,
    isLoading = false,
    platforms,
}: Props) {
    if (isLoading) {
        return (
            <nav
                className={`social-links ${compact ? 'social-links--compact' : ''}`}
                aria-busy="true"
                aria-label="Социальные площадки загружаются"
            >
                {skeletonItems.map((item) => (
                    <span className="social-link social-link--skeleton" key={item} />
                ))}
            </nav>
        );
    }

    if (hasError || platforms.length === 0) {
        return (
            <nav
                className={`social-links ${compact ? 'social-links--compact' : ''}`}
                aria-label="Социальные площадки"
            >
                {!compact && (
                    <span className="social-links__status">Площадки временно недоступны</span>
                )}
            </nav>
        );
    }

    return (
        <nav
            className={`social-links ${compact ? 'social-links--compact' : ''}`}
            aria-label="Социальные площадки"
        >
            {platforms.map(({ icon, id, name, slug, url }) => {
                const Icon =
                    platformIcons[icon ?? slug] ?? platformIcons[slug] ?? fallbackPlatformIcon;

                return (
                    <a
                        key={id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                        aria-label={name}
                    >
                        <Icon className="social-link__icon" />

                        {!compact && <span>{name}</span>}
                    </a>
                );
            })}
        </nav>
    );
}
