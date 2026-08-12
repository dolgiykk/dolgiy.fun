import './AuthForm.css';

import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthApiError, forgotPassword } from '../../api/auth';
import Container from '../layout/Container/Container';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setIsSubmitting(true);

        try {
            const result = await forgotPassword(email);
            setMessage(result);
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : 'Не удалось отправить письмо');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page">
            <Container>
                <form className="auth-card" onSubmit={onSubmit}>
                    <span className="section-kicker">Аккаунт</span>
                    <h1>Восстановление пароля</h1>
                    <p>Пришлём ссылку на email, если аккаунт существует.</p>

                    {error ? <p className="auth-card__error">{error}</p> : null}
                    {message ? <p className="auth-card__success">{message}</p> : null}

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" className="auth-card__submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Отправляем…' : 'Отправить ссылку'}
                    </button>

                    <p className="auth-card__links">
                        <Link to="/login">Назад ко входу</Link>
                    </p>
                </form>
            </Container>
        </section>
    );
}
