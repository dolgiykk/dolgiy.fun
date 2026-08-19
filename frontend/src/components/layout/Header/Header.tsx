import './Header.css';

import { Link } from 'react-router-dom';

import { publicName } from '../../../auth/publicName';
import type { AuthUser } from '../../../types/auth';
import type { Platform } from '../../../types/platform';
import SocialLinks from '../../ui/SocialLinks/SocialLinks';
import Container from '../Container/Container';

type Props = {
    isPlatformsLoading: boolean;
    platforms: Platform[];
    platformsError: boolean;
    user: AuthUser | null;
    isAuthLoading: boolean;
    onLogout: () => Promise<void>;
};

export default function Header({
    isPlatformsLoading,
    platforms,
    platformsError,
    user,
    isAuthLoading,
    onLogout,
}: Props) {
    const avatarFallback = user
        ? publicName(user).replace('@', '').trim().charAt(0).toUpperCase() || 'U'
        : null;

    return (
        <header className="header">
            <Container>
                <div className="header__inner">
                    <Link to="/" className="header__logo">
                        <span className="header__mark" aria-hidden="true">
                            D
                        </span>

                        <span className="header__brand">
                            <strong>DOLGIY.FUN</strong>
                            <small>voice cinema</small>
                        </span>
                    </Link>

                    <nav className="header__nav" aria-label="Основная навигация">
                        <a href="/#videos">Видео</a>
                        <a href="/#about">О проекте</a>
                    </nav>

                    <div className="header__actions">
                        <SocialLinks
                            compact
                            hasError={platformsError}
                            isLoading={isPlatformsLoading}
                            platforms={platforms}
                        />

                        {!isAuthLoading &&
                            (user ? (
                                <>
                                    <Link to="/account" className="header__user">
                                        {user.avatar_url ? (
                                            <img
                                                className="header__user-avatar"
                                                src={user.avatar_url}
                                                alt={publicName(user)}
                                            />
                                        ) : (
                                            <span className="header__user-avatar header__user-avatar--placeholder">
                                                {avatarFallback}
                                            </span>
                                        )}
                                        <span className="header__user-name">
                                            {publicName(user)}
                                        </span>
                                    </Link>
                                    <button
                                        type="button"
                                        className="header__cta header__cta--ghost"
                                        onClick={() => {
                                            void onLogout();
                                        }}
                                    >
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="header__user">
                                        Войти
                                    </Link>
                                    <Link to="/register" className="header__cta">
                                        Регистрация
                                    </Link>
                                </>
                            ))}
                    </div>
                </div>
            </Container>
        </header>
    );
}
