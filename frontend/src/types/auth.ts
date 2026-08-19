export type AuthUser = {
    id: number;
    username: string | null;
    display_name: string | null;
    email: string | null;
    role: 'user' | 'admin';
    avatar_url: string | null;
    can_upload_avatar: boolean;
    email_verified_at: string | null;
    needs_username: boolean;
};
