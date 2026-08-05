import './Footer.css';

import Container from '../Container/Container';
import SocialLinks from '../../ui/SocialLinks/SocialLinks';
import type { Platform } from '../../../types/platform';

type Props = {
    isPlatformsLoading: boolean;
    platforms: Platform[];
    platformsError: boolean;
};

export default function Footer({ isPlatformsLoading, platforms, platformsError }: Props) {
    return (
        <footer className="footer">
            <Container>
                <div className="footer__top">
                    <div className="footer__brand">
                        <span>DOLGIY.FUN</span>

                        <h2>Озвучка поверх оригинала</h2>

                        <p>
                            Любительская озвучка фильмов: русский голос, оригинальная атмосфера и
                            чистая подача.
                        </p>
                    </div>

                    <SocialLinks
                        hasError={platformsError}
                        isLoading={isPlatformsLoading}
                        platforms={platforms}
                    />
                </div>

                <div className="footer__bottom">
                    <span>© {new Date().getFullYear()} DOLGIY.FUN</span>

                    <span>Сделано с любовью к кино и программированию</span>
                </div>
            </Container>
        </footer>
    );
}
