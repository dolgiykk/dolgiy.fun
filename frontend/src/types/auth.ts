export type AuthUser = {
    id: number;
    username: string | null;
    email: string;
    role: 'user' | 'admin';
    avatar_url: string | null;
    email_verified_at: string | null;
    needs_username: boolean;
};
