import './Header.css';

import Container from '../Container/Container';
import SocialLinks from '../../ui/SocialLinks/SocialLinks';

export default function Header() {
    return (
        <header className="header">
            <Container>
                <div className="header__inner">
                    <a href="/" className="header__logo">
                        <span>🎙️</span>

                        <span>DOLGIY.FUN</span>
                    </a>

                    <SocialLinks compact />
                </div>
            </Container>
        </header>
    );
}
