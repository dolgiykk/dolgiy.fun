import './Hero.css';

export default function Hero() {
    return (
        <section className="hero">
            <div className="hero__content">
                <span className="hero__badge">Любительская озвучка кино</span>

                <h1 className="hero__title">Голос, который добавляет кино атмосферы</h1>

                <p className="hero__subtitle">
                    DOLGIY.FUN — место для моих озвучек, любимых фильмов и живой студийной энергии.
                    Чисто, ярко и без лишнего шума.
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
                        <dd>voice acting</dd>
                    </div>

                    <div>
                        <dt>Настроение</dt>
                        <dd>cinema</dd>
                    </div>

                    <div>
                        <dt>Подача</dt>
                        <dd>clean cut</dd>
                    </div>
                </dl>
            </div>

            <div className="hero__visual" aria-hidden="true">
                <div className="hero__screen">
                    <div className="hero__screen-top">
                        <span>REC</span>
                        <span>VOICE TRACK 01</span>
                    </div>

                    <div className="hero__waveform">
                        {Array.from({ length: 20 }, (_, index) => (
                            <span key={index} />
                        ))}
                    </div>

                    <div className="hero__caption">
                        <span>dub session</span>
                        <strong>DOLGIY.FUN</strong>
                    </div>
                </div>

                <div className="hero__reel hero__reel--left" />
                <div className="hero__reel hero__reel--right" />
            </div>
        </section>
    );
}
