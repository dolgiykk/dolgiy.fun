import { createContext, type ReactNode } from 'react';

import type { AuthUser } from '../types/auth';

export type AuthContextValue = {
    user: AuthUser | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
    login: (input: { email: string; password: string; remember?: boolean }) => Promise<AuthUser>;
    register: (input: {
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => Promise<AuthUser>;
    logout: () => Promise<void>;
    completeProfile: (input: { username: string }) => Promise<AuthUser>;
    resendVerification: () => Promise<string>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
    children: ReactNode;
};
