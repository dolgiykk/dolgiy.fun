import './Hero.css';

import { useState } from 'react';

import type { DubVideo } from '../../../types/latestDub';
import VideoModal from '../../ui/VideoModal/VideoModal';

type Props = {
    isLoading: boolean;
    latestDub: DubVideo | null;
};

export default function Hero({ isLoading, latestDub }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section className="hero">
            <div className="hero__content">
                <span className="hero__badge">Русский голос поверх оригинала</span>

                <h1 className="hero__title">Голос, который добавляет кино атмосферы</h1>

                <p className="hero__subtitle">
                    DOLGIY.FUN — любительская озвучка: русский голос поверх оригинальной дорожки.
                    Сохраняю настроение сцены и не заглушаю картину лишним шумом.
                </p>

                <div className="hero__actions">
                    <a href="#platforms" className="hero__button hero__button--primary">
                        К площадкам
                    </a>

                    <a href="#about" className="hero__button hero__button--secondary">
                        О проекте
                    </a>
                </div>

                <dl className="hero__meta">
                    <div>
                        <dt>Формат</dt>
                        <dd>voice-over</dd>
                    </div>

                    <div>
                        <dt>Дорожка</dt>
                        <dd>original + RU</dd>
                    </div>

                    <div>
                        <dt>Подача</dt>
                        <dd>clean cut</dd>
                    </div>
                </dl>
            </div>

            <div className="hero__visual">
                <div className="hero__screen">
                    <div className="hero__screen-top">
                        <span>REC</span>
                        <span>OVER ORIGINAL</span>
                    </div>

                    {latestDub ? (
                        <button
                            type="button"
                            className="hero__player"
                            onClick={() => setIsModalOpen(true)}
                            aria-label={`Смотреть: ${latestDub.title}`}
                        >
                            {latestDub.thumbnail_url ? (
                                <img
                                    src={latestDub.thumbnail_url}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <span className="hero__player-fallback" aria-hidden="true">
                                    REC
                                </span>
                            )}

                            <span className="hero__play" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                    <path d="M8 5.14v13.72L19 12 8 5.14z" />
                                </svg>
                            </span>
                        </button>
                    ) : (
                        <div className="hero__waveform" aria-hidden="true" aria-busy={isLoading}>
                            {Array.from({ length: 20 }, (_, index) => (
                                <span key={index} />
                            ))}
                        </div>
                    )}

                    <div className="hero__caption">
                        <span>{latestDub ? 'Самая свежая озвучка' : 'dub session'}</span>
                        <strong className={latestDub ? undefined : 'hero__caption-brand'}>
                            {latestDub ? latestDub.title : 'DOLGIY.FUN'}
                        </strong>
                    </div>
                </div>

                <div className="hero__reel hero__reel--left" aria-hidden="true" />
                <div className="hero__reel hero__reel--right" aria-hidden="true" />
            </div>

            <VideoModal
                video={isModalOpen ? latestDub : null}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    );
}
