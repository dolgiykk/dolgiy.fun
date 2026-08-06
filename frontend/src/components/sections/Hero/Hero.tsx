import './Hero.css';

import type { DubVideo } from '../../../types/latestDub';

type Props = {
    isLoading: boolean;
    latestDub: DubVideo | null;
};

export default function Hero({ isLoading, latestDub }: Props) {
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
                        <div className="hero__player">
                            <iframe
                                src={latestDub.embed_url}
                                title={latestDub.title}
                                loading="lazy"
                                allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
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
        </section>
    );
}
