import './SocialLinks.css';

import { socialLinks } from '../../../data/social.tsx';

type Props = {
    compact?: boolean;
};

export default function SocialLinks({ compact = false }: Props) {
    return (
        <nav className={`social-links ${compact ? 'social-links--compact' : ''}`}>
            {socialLinks.map(({ title, href, icon: Icon }) => (
                <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                    aria-label={title}
                >
                    <Icon className="social-link__icon" />

                    {!compact && <span>{title}</span>}
                </a>
            ))}
        </nav>
    );
}
