export type DubVideo = {
    id: string;
    title: string;
    url: string;
    embed_url: string;
    thumbnail_url: string | null;
};

export type DubsCatalog = {
    latest: DubVideo | null;
    others: DubVideo[];
};
