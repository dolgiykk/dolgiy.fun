import './OtherVideos.css';

import { useState } from 'react';

import type { DubVideo } from '../../../types/latestDub';
import Container from '../../layout/Container/Container';
import VideoModal from '../../ui/VideoModal/VideoModal';

type Props = {
    isLoading: boolean;
    videos: DubVideo[];
};

type VideoCardProps = {
    video: DubVideo;
    onSelect: (video: DubVideo) => void;
};

function VideoCard({ video, onSelect }: VideoCardProps) {
    return (
        <button
            type="button"
            className="other-videos__card"
            onClick={() => onSelect(video)}
            aria-label={`Смотреть: ${video.title}`}
        >
            <span className="other-videos__poster">
                {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" loading="lazy" decoding="async" />
                ) : (
                    <span className="other-videos__poster-fallback" aria-hidden="true">
                        REC
                    </span>
                )}

                <span className="other-videos__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8 5.14v13.72L19 12 8 5.14z" />
                    </svg>
                </span>
            </span>

            <span className="other-videos__title">{video.title}</span>
        </button>
    );
}

export default function OtherVideos({ isLoading, videos }: Props) {
    const [activeVideo, setActiveVideo] = useState<DubVideo | null>(null);

    if (!isLoading && videos.length === 0) {
        return null;
    }

    return (
        <section className="other-videos" id="videos">
            <Container>
                <div className="showcase__intro">
                    <span className="section-kicker">Архив</span>
                    <h2>Другие видео</h2>
                    <p>Ещё озвучки с канала — откройте любой ролик прямо на сайте.</p>
                </div>

                {isLoading ? (
                    <div
                        className="other-videos__grid"
                        aria-busy="true"
                        aria-label="Видео загружаются"
                    >
                        {Array.from({ length: 3 }, (_, index) => (
                            <div className="other-videos__skeleton" key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="other-videos__grid">
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} onSelect={setActiveVideo} />
                        ))}
                    </div>
                )}
            </Container>

            <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
        </section>
    );
}
