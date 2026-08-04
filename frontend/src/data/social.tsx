import type { ComponentType, SVGProps } from 'react';

import { FaExternalLinkAlt, FaInstagram, FaTelegramPlane, FaVk, FaYoutube } from 'react-icons/fa';

import RutubeIcon from '../assets/icons/rutube.svg?react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const platformIcons: Record<string, IconComponent> = {
    telegram: FaTelegramPlane,
    instagram: FaInstagram,
    vkvideo: FaVk,
    rutube: RutubeIcon,
    youtube: FaYoutube,
};

export const fallbackPlatformIcon = FaExternalLinkAlt;
