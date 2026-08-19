import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthApiError } from '../../api/auth';
import LoginPage from './LoginPage';

const login = vi.fn();

vi.mock('../../auth/useAuth', () => ({
    useAuth: () => ({
        login,
        loginWithVk: vi.fn(),
    }),
}));

describe('LoginPage', () => {
    it('submits login form', async () => {
        const user = userEvent.setup();
        login.mockResolvedValue({ needs_username: false });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText('Email'), 'fan@example.com');
        await user.type(screen.getByLabelText('Пароль'), 'Password1!');
        await user.click(screen.getByRole('button', { name: 'Войти' }));

        expect(login).toHaveBeenCalledWith({
            email: 'fan@example.com',
            password: 'Password1!',
            remember: true,
        });
    });

    it('shows api error message', async () => {
        const user = userEvent.setup();
        login.mockRejectedValue(new AuthApiError(422, 'Неверный email или пароль.'));

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText('Email'), 'fan@example.com');
        await user.type(screen.getByLabelText('Пароль'), 'bad');
        await user.click(screen.getByRole('button', { name: 'Войти' }));

        expect(await screen.findByText('Неверный email или пароль.')).toBeInTheDocument();
    });
});
