import './VideoModal.css';

import { useEffect, useEffectEvent, useRef } from 'react';

import type { DubVideo } from '../../../types/latestDub';

type Props = {
    video: DubVideo | null;
    onClose: () => void;
};

export default function VideoModal({ video, onClose }: Props) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const handleEscape = useEffectEvent(() => {
        onClose();
    });

    useEffect(() => {
        if (!video) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleEscape();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [video]);

    if (!video) {
        return null;
    }

    return (
        <div className="video-modal" role="presentation" onClick={onClose}>
            <div
                className="video-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="video-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="video-modal__top">
                    <h2 id="video-modal-title" className="video-modal__title">
                        {video.title}
                    </h2>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="video-modal__close"
                        aria-label="Закрыть видео"
                        onClick={onClose}
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div className="video-modal__player">
                    <iframe
                        src={video.embed_url}
                        title={video.title}
                        allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture; autoplay"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
}
