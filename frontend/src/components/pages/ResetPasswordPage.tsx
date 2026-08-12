import './AuthForm.css';

import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { AuthApiError, resetPassword } from '../../api/auth';
import Container from '../layout/Container/Container';

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = params.get('token') || '';

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate('/login');
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : 'Не удалось сбросить пароль');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page">
            <Container>
                <form className="auth-card" onSubmit={onSubmit}>
                    <span className="section-kicker">Аккаунт</span>
                    <h1>Новый пароль</h1>

                    {error ? <p className="auth-card__error">{error}</p> : null}

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
                        Новый пароль
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

                    <button
                        type="submit"
                        className="auth-card__submit"
                        disabled={isSubmitting || !token}
                    >
                        {isSubmitting ? 'Сохраняем…' : 'Сохранить пароль'}
                    </button>

                    <p className="auth-card__links">
                        <Link to="/login">Ко входу</Link>
                    </p>
                </form>
            </Container>
        </section>
    );
}
