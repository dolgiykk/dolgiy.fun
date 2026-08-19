import './AuthForm.css';

import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { AuthApiError } from '../../api/auth';
import { publicName } from '../../auth/publicName';
import { useAuth } from '../../auth/useAuth';
import Container from '../layout/Container/Container';

export default function AccountPage() {
    const { user, isLoading, logout, refresh, resendVerification } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showVerifiedBanner] = useState(() => searchParams.get('verified') === '1');
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!showVerifiedBanner) {
            return;
        }

        void refresh();

        if (searchParams.get('verified') === '1') {
            setSearchParams({}, { replace: true });
        }
    }, [refresh, searchParams, setSearchParams, showVerifiedBanner]);

    if (isLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.needs_username) {
        return <Navigate to="/complete-profile" replace />;
    }

    const isVerified = Boolean(user.email_verified_at);
    const showEmail = Boolean(user.email);
    const canResendVerification = showEmail && Boolean(user.username) && !isVerified;

    return (
        <section className="auth-page">
            <Container>
                <div className="auth-card">
                    <span className="section-kicker">Аккаунт</span>
                    <h1>{publicName(user)}</h1>
                    {user.role === 'admin' ? <p>admin</p> : null}

                    {showVerifiedBanner && showEmail ? (
                        <p className="auth-card__success">Email подтверждён. Аккаунт активен.</p>
                    ) : null}

                    {resendError ? <p className="auth-card__error">{resendError}</p> : null}
                    {resendMessage ? <p className="auth-card__success">{resendMessage}</p> : null}

                    {showEmail ? (
                        <dl className="auth-card__meta">
                            <div>
                                <dt>Email</dt>
                                <dd>{user.email}</dd>
                            </div>
                            {user.username ? (
                                <div>
                                    <dt>Статус email</dt>
                                    <dd>{isVerified ? 'подтверждён' : 'не подтверждён'}</dd>
                                </div>
                            ) : null}
                        </dl>
                    ) : null}

                    {canResendVerification ? (
                        <button
                            type="button"
                            className="auth-card__submit"
                            disabled={isResending}
                            onClick={async () => {
                                setResendError(null);
                                setResendMessage(null);
                                setIsResending(true);

                                try {
                                    await resendVerification();
                                    setResendMessage('Письмо отправлено. Проверьте почту.');
                                } catch (err) {
                                    if (err instanceof AuthApiError) {
                                        setResendError(err.message);
                                    } else {
                                        setResendError('Не удалось отправить письмо');
                                    }
                                } finally {
                                    setIsResending(false);
                                }
                            }}
                        >
                            {isResending ? 'Отправляем…' : 'Отправить письмо ещё раз'}
                        </button>
                    ) : null}

                    <button
                        type="button"
                        className="auth-card__submit"
                        onClick={async () => {
                            await logout();
                            navigate('/');
                        }}
                    >
                        Выйти
                    </button>
                </div>
            </Container>
        </section>
    );
}
