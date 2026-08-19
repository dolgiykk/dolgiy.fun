import './AuthForm.css';

import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthApiError } from '../../api/auth';
import { useAuth } from '../../auth/useAuth';
import Container from '../layout/Container/Container';
import VkIdOAuthList from './VkIdOAuthList';

export default function RegisterPage() {
    const { register, loginWithVk } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await register({
                username: username.toLowerCase(),
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate('/account');
        } catch (err) {
            if (err instanceof AuthApiError) {
                const first = Object.values(err.errors)[0]?.[0];
                setError(first || err.message);
            } else {
                setError('Не удалось зарегистрироваться');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function onVkSuccess(accessToken: string) {
        setError(null);
        try {
            const user = await loginWithVk(accessToken);
            navigate(user.needs_username ? '/complete-profile' : '/account');
        } catch (err) {
            if (err instanceof AuthApiError) {
                const first = Object.values(err.errors)[0]?.[0];
                setError(first || err.message);
            } else {
                setError('Не удалось войти через VK.');
            }
        }
    }

    return (
        <section className="auth-page">
            <Container>
                <form className="auth-card" onSubmit={onSubmit}>
                    <span className="section-kicker">Аккаунт</span>
                    <h1>Регистрация</h1>
                    <p>Username понадобится для комментариев. Только a-z, 0-9 и _.</p>

                    {error ? <p className="auth-card__error">{error}</p> : null}

                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value.toLowerCase())}
                            pattern="[a-z0-9_]{3,30}"
                            minLength={3}
                            maxLength={30}
                            required
                        />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Пароль
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Повтор пароля
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(event) => setPasswordConfirmation(event.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" className="auth-card__submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Создаём…' : 'Создать аккаунт'}
                    </button>

                    <p className="auth-card__divider">или</p>

                    <VkIdOAuthList onSuccess={onVkSuccess} />

                    <p className="auth-card__links">
                        <Link to="/login">Уже есть аккаунт</Link>
                    </p>
                </form>
            </Container>
        </section>
    );
}
