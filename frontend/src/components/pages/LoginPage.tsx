import './AuthForm.css';

import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthApiError } from '../../api/auth';
import { useAuth } from '../../auth/useAuth';
import Container from '../layout/Container/Container';
import VkIdOAuthList from './VkIdOAuthList';

export default function LoginPage() {
    const { login, loginWithVk } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const user = await login({ email, password, remember: true });
            navigate(user.needs_username ? '/complete-profile' : '/account');
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : 'Не удалось войти');
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
            setError(err instanceof AuthApiError ? err.message : 'Не удалось войти через VK.');
        }
    }

    return (
        <section className="auth-page">
            <Container>
                <form className="auth-card" onSubmit={onSubmit}>
                    <span className="section-kicker">Аккаунт</span>
                    <h1>Вход</h1>
                    <p>Войдите по email и паролю или через VK ID.</p>

                    {error ? <p className="auth-card__error">{error}</p> : null}

                    <label>
                        Email
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Пароль
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" className="auth-card__submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Входим…' : 'Войти'}
                    </button>

                    <p className="auth-card__links">
                        <Link to="/forgot-password">Забыли пароль?</Link>
                        <Link to="/register">Регистрация</Link>
                    </p>

                    <p className="auth-card__divider">или</p>

                    <VkIdOAuthList onSuccess={onVkSuccess} />
                </form>
            </Container>
        </section>
    );
}
