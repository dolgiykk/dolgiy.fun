import type { Platform } from '../types/platform';

export const mockPlatforms: Platform[] = [
    {
        id: 1,
        slug: 'telegram',
        name: 'Telegram',
        url: 'https://t.me/dolgiy_fun',
        icon: 'telegram',
        is_active: true,
        sort_order: 10,
    },
    {
        id: 2,
        slug: 'youtube',
        name: 'YouTube',
        url: 'https://youtube.com/@dolgiy_fun',
        icon: 'youtube',
        is_active: true,
        sort_order: 20,
    },
];
