import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    fetchCurrentUser,
    loginUser,
    loginWithVk,
    logoutUser,
    registerUser,
    resendEmailVerification,
    uploadAvatar,
    updateProfile,
} from '../api/auth';
import type { AuthUser } from '../types/auth';
import { AuthContext, type AuthProviderProps } from './auth-context';

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        const current = await fetchCurrentUser();
        setUser(current);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        fetchCurrentUser(controller.signal)
            .then((current) => {
                if (!controller.signal.aborted) {
                    setUser(current);
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setUser(null);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            refresh,
            async login(input: { email: string; password: string; remember?: boolean }) {
                const next = await loginUser(input);
                setUser(next);
                return next;
            },
            async loginWithVk(accessToken: string) {
                const next = await loginWithVk(accessToken);
                setUser(next);
                return next;
            },
            async register(input: {
                username: string;
                email: string;
                password: string;
                password_confirmation: string;
            }) {
                const next = await registerUser(input);
                setUser(next);
                return next;
            },
            async logout() {
                await logoutUser();
                setUser(null);
            },
            async completeProfile(input: { username: string }) {
                const next = await updateProfile(input);
                setUser(next);
                return next;
            },
            async uploadAvatar(file: File) {
                const next = await uploadAvatar(file);
                setUser(next);
                return next;
            },
            async resendVerification() {
                return resendEmailVerification();
            },
        }),
        [user, isLoading, refresh],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
