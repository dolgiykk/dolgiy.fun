import './Footer.css';

import Container from '../Container/Container';
import SocialLinks from '../../ui/SocialLinks/SocialLinks';

export default function Footer() {
    return (
        <footer className="footer">
            <Container>
                <div className="footer__top">
                    <div className="footer__brand">
                        <p>Любительская озвучка фильмов. Голос, атмосфера и любимое кино.</p>
                    </div>

                    <SocialLinks compact />
                </div>

                <div className="footer__bottom">
                    <span>© {new Date().getFullYear()} DOLGIY.FUN</span>

                    <span>Сделано с любовью к кино и программированию</span>
                </div>
            </Container>
        </footer>
    );
}
