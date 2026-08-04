import './Header.css';

import Container from '../Container/Container';
import SocialLinks from '../../ui/SocialLinks/SocialLinks';

export default function Header() {
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
                        <SocialLinks compact />

                        <a href="#platforms" className="header__cta">
                            К площадкам
                        </a>
                    </div>
                </div>
            </Container>
        </header>
    );
}
