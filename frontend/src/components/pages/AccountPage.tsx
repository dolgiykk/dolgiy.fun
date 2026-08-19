import './AuthForm.css';

import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { AuthApiError } from '../../api/auth';
import { publicName } from '../../auth/publicName';
import { useAuth } from '../../auth/useAuth';
import Container from '../layout/Container/Container';

export default function AccountPage() {
    const { user, isLoading, logout, refresh, resendVerification, uploadAvatar } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showVerifiedBanner] = useState(() => searchParams.get('verified') === '1');
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
    const avatarFallback = publicName(user).replace('@', '').trim().charAt(0).toUpperCase() || 'U';

    return (
        <section className="auth-page">
            <Container>
                <div className="auth-card">
                    <span className="section-kicker">Аккаунт</span>
                    <div className="auth-card__profile-header">
                        {user.avatar_url ? (
                            <img
                                className="auth-card__avatar"
                                src={user.avatar_url}
                                alt={publicName(user)}
                            />
                        ) : (
                            <div className="auth-card__avatar auth-card__avatar--placeholder">
                                {avatarFallback}
                            </div>
                        )}
                        <div className="auth-card__profile-copy">
                            <h1>{publicName(user)}</h1>
                            {user.role === 'admin' ? <p>admin</p> : null}
                        </div>
                    </div>

                    {showVerifiedBanner && showEmail ? (
                        <p className="auth-card__success">Email подтверждён. Аккаунт активен.</p>
                    ) : null}

                    {resendError ? <p className="auth-card__error">{resendError}</p> : null}
                    {resendMessage ? <p className="auth-card__success">{resendMessage}</p> : null}
                    {avatarError ? <p className="auth-card__error">{avatarError}</p> : null}
                    {avatarMessage ? <p className="auth-card__success">{avatarMessage}</p> : null}

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

                    {user.can_upload_avatar ? (
                        <div className="auth-card__upload">
                            <span>Аватар</span>
                            <label className="auth-card__file-trigger auth-card__file-trigger--compact">
                                <input
                                    className="auth-card__file-input"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    disabled={isUploadingAvatar}
                                    onChange={async (event) => {
                                        const input = event.currentTarget;
                                        const file = input.files?.[0];
                                        if (!file) {
                                            return;
                                        }

                                        setAvatarError(null);
                                        setAvatarMessage(null);
                                        setIsUploadingAvatar(true);

                                        try {
                                            await uploadAvatar(file);
                                            input.value = '';
                                            setAvatarMessage('Аватар обновлён.');
                                        } catch (err) {
                                            if (err instanceof AuthApiError) {
                                                setAvatarError(err.message);
                                            } else {
                                                setAvatarError('Не удалось загрузить аватар');
                                            }
                                        } finally {
                                            setIsUploadingAvatar(false);
                                        }
                                    }}
                                />
                                {isUploadingAvatar ? 'Загружаем…' : 'Выбрать файл'}
                            </label>
                        </div>
                    ) : null}

                    <div className="auth-card__actions">
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
                            className="auth-card__submit auth-card__submit--logout"
                            onClick={async () => {
                                await logout();
                                navigate('/');
                            }}
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
