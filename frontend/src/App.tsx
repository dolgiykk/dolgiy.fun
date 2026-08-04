import './App.css';

import Header from './components/layout/Header/Header';
import Hero from './components/sections/Hero/Hero';
import Footer from './components/layout/Footer/Footer';
import Container from './components/layout/Container/Container';
import Background from './components/layout/Background/Background';
import SocialLinks from './components/ui/SocialLinks/SocialLinks';

const highlights = [
    {
        label: 'Голос',
        title: 'Озвучка с характером',
        text: 'Сохраняю настроение сцены и добавляю живой голосовой акцент без лишнего шума.',
    },
    {
        label: 'Кино',
        title: 'Атмосфера кадра',
        text: 'Визуальный стиль сайта строится вокруг света кинозала, постеров и студийной энергии.',
    },
    {
        label: 'Релизы',
        title: 'Удобные площадки',
        text: 'Социальные каналы собраны в одном месте, чтобы быстро найти новые озвучки.',
    },
];

export default function App() {
    return (
        <>
            <Background />

            <Header />

            <main className="page">
                <Container>
                    <Hero />
                </Container>

                <section className="showcase" id="about">
                    <Container>
                        <div className="showcase__intro">
                            <span className="section-kicker">О проекте</span>

                            <h2>Коротко, ярко и с любовью к кино</h2>
                        </div>

                        <div className="showcase__grid">
                            {highlights.map((item) => (
                                <article className="showcase-card" key={item.title}>
                                    <span>{item.label}</span>

                                    <h3>{item.title}</h3>

                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>
                    </Container>
                </section>

                <section className="platforms" id="platforms">
                    <Container>
                        <div className="platforms__panel">
                            <div>
                                <span className="section-kicker">Площадки</span>

                                <h2>Следите за новыми озвучками там, где удобно</h2>
                            </div>

                            <SocialLinks />
                        </div>
                    </Container>
                </section>
            </main>

            <Footer />
        </>
    );
}
