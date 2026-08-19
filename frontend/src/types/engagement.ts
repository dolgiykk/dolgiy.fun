export type VideoComment = {
    id: number;
    body: string;
    created_at: string | null;
    user: {
        id: number;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
    };
};

export type VideoEngagement = {
    likes_count: number;
    liked: boolean;
    comments_count: number;
    has_more: boolean;
    comments: VideoComment[];
};
