import './Header.css';

import Container from '../Container/Container';
import SocialLinks from '../../ui/SocialLinks/SocialLinks';
import type { Platform } from '../../../types/platform';

type Props = {
    isPlatformsLoading: boolean;
    platforms: Platform[];
    platformsError: boolean;
};

export default function Header({ isPlatformsLoading, platforms, platformsError }: Props) {
    return (
        <header className="header">
            <Container>
                <div className="header__inner">
                    <a href="/" className="header__logo">
                        <span className="header__mark" aria-hidden="true">
                            D
                        </span>

                        <span>
                            <strong>DOLGIY.FUN</strong>
                            <small>voice cinema</small>
                        </span>
                    </a>

                    <nav className="header__nav" aria-label="Основная навигация">
                        <a href="#about">О проекте</a>
                        <a href="#platforms">Площадки</a>
                    </nav>

                    <div className="header__actions">
                        <SocialLinks
                            compact
                            hasError={platformsError}
                            isLoading={isPlatformsLoading}
                            platforms={platforms}
                        />

                        <a href="#platforms" className="header__cta">
                            К площадкам
                        </a>
                    </div>
                </div>
            </Container>
        </header>
    );
}
