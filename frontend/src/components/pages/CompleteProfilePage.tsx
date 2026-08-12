import './AuthForm.css';

import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthApiError } from '../../api/auth';
import { useAuth } from '../../auth/useAuth';
import Container from '../layout/Container/Container';

export default function CompleteProfilePage() {
    const { user, isLoading, completeProfile } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.needs_username) {
        return <Navigate to="/account" replace />;
    }

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await completeProfile({
                username: username.toLowerCase(),
            });
            navigate('/account');
        } catch (err) {
            if (err instanceof AuthApiError) {
                const first = Object.values(err.errors)[0]?.[0];
                setError(first || err.message);
            } else {
                setError('Не удалось сохранить профиль');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page">
            <Container>
                <form className="auth-card" onSubmit={onSubmit}>
                    <span className="section-kicker">Профиль</span>
                    <h1>Выберите username</h1>
                    <p>Он будет виден в комментариях. Только латиница, цифры и _.</p>

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

                    <button type="submit" className="auth-card__submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Сохраняем…' : 'Продолжить'}
                    </button>
                </form>
            </Container>
        </section>
    );
}
