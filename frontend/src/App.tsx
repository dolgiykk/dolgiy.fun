import './App.css';

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { fetchDubs } from './api/dubs';
import { fetchPlatforms } from './api/platforms';
import { useAuth } from './auth/useAuth';
import Header from './components/layout/Header/Header';
import Hero from './components/sections/Hero/Hero';
import OtherVideos from './components/sections/OtherVideos/OtherVideos';
import Footer from './components/layout/Footer/Footer';
import Container from './components/layout/Container/Container';
import Background from './components/layout/Background/Background';
import AccountPage from './components/pages/AccountPage';
import CompleteProfilePage from './components/pages/CompleteProfilePage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import SocialLinks from './components/ui/SocialLinks/SocialLinks';
import type { DubVideo } from './types/latestDub';
import type { Platform } from './types/platform';

const highlights = [
    {
        label: 'Голос',
        title: 'Озвучка с характером',
        text: 'Сохраняю настроение сцены и добавляю живой голосовой акцент без лишнего шума.',
    },
    {
        label: 'Оригинал',
        title: 'Оригинал остаётся',
        text: 'Не подменяю звуковую картину целиком: оставляю оригинальную дорожку и накладываю русский голос поверх неё.',
    },
    {
        label: 'Релизы',
        title: 'Новые озвучки в эфире',
        text: 'Свежие работы выходят на площадках — заглядывайте, чтобы не пропустить следующий релиз.',
    },
];

function HomePage({
    platforms,
    isPlatformsLoading,
    platformsError,
    latestDub,
    otherVideos,
    isDubsLoading,
}: {
    platforms: Platform[];
    isPlatformsLoading: boolean;
    platformsError: boolean;
    latestDub: DubVideo | null;
    otherVideos: DubVideo[];
    isDubsLoading: boolean;
}) {
    return (
        <main className="page">
            <Container>
                <Hero isLoading={isDubsLoading} latestDub={latestDub} />
            </Container>

            <OtherVideos isLoading={isDubsLoading} videos={otherVideos} />

            <section className="showcase" id="about">
                <Container>
                    <div className="showcase__intro">
                        <span className="section-kicker">О проекте</span>
                        <h2>Русский голос. Оригинальная атмосфера.</h2>
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

                        <SocialLinks
                            hasError={platformsError}
                            isLoading={isPlatformsLoading}
                            platforms={platforms}
                        />
                    </div>
                </Container>
            </section>
        </main>
    );
}

export default function App() {
    const { user, isLoading: isAuthLoading, logout } = useAuth();
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [isPlatformsLoading, setIsPlatformsLoading] = useState(true);
    const [platformsError, setPlatformsError] = useState(false);

    const [latestDub, setLatestDub] = useState<DubVideo | null>(null);
    const [otherVideos, setOtherVideos] = useState<DubVideo[]>([]);
    const [isDubsLoading, setIsDubsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        fetchPlatforms(controller.signal)
            .then((items) => {
                setPlatforms(items);
                setPlatformsError(false);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setPlatformsError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsPlatformsLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        fetchDubs(controller.signal)
            .then((catalog) => {
                setLatestDub(catalog.latest);
                setOtherVideos(catalog.others);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setLatestDub(null);
                setOtherVideos([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsDubsLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <>
            <Background />

            <Header
                isPlatformsLoading={isPlatformsLoading}
                platforms={platforms}
                platformsError={platformsError}
                user={user}
                isAuthLoading={isAuthLoading}
                onLogout={logout}
            />

            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            platforms={platforms}
                            isPlatformsLoading={isPlatformsLoading}
                            platformsError={platformsError}
                            latestDub={latestDub}
                            otherVideos={otherVideos}
                            isDubsLoading={isDubsLoading}
                        />
                    }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/complete-profile" element={<CompleteProfilePage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Footer
                isPlatformsLoading={isPlatformsLoading}
                platforms={platforms}
                platformsError={platformsError}
            />
        </>
    );
}
