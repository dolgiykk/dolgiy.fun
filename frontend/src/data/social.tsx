import type { ComponentType, SVGProps } from 'react';

import { FaInstagram, FaTelegramPlane, FaVk, FaYoutube } from 'react-icons/fa';

import RutubeIcon from '../assets/icons/rutube.svg?react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type SocialLink = {
    title: string;
    href: string;
    icon: IconComponent;
};

export const socialLinks: SocialLink[] = [
    {
        title: 'Telegram',
        href: '#',
        icon: FaTelegramPlane,
    },
    {
        title: 'Instagram',
        href: '#',
        icon: FaInstagram,
    },
    {
        title: 'VK Видео',
        href: '#',
        icon: FaVk,
    },
    {
        title: 'RuTube',
        href: '#',
        icon: RutubeIcon,
    },
    {
        title: 'YouTube',
        href: '#',
        icon: FaYoutube,
    },
];
