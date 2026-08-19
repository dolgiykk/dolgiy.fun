import './VideoEngagement.css';

import { type FormEvent, type ReactNode, useEffect, useId, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import {
    createComment,
    deleteComment,
    EngagementApiError,
    fetchVideoEngagement,
    likeVideo,
    unlikeVideo,
} from '../../../api/engagement';
import { publicName } from '../../../auth/publicName';
import { useAuth } from '../../../auth/useAuth';
import type { VideoComment } from '../../../types/engagement';

type Props = {
    videoId: string;
    children: ReactNode;
};

function formatCommentDate(value: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const months = [
        'янв',
        'фев',
        'мар',
        'апр',
        'мая',
        'июн',
        'июл',
        'авг',
        'сен',
        'окт',
        'ноя',
        'дек',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()] ?? '';
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function formatCommentsCount(count: number): string {
    const abs = Math.abs(count) % 100;
    const last = abs % 10;
    let word = 'комментариев';

    if (abs < 11 || abs > 14) {
        if (last === 1) {
            word = 'комментарий';
        } else if (last >= 2 && last <= 4) {
            word = 'комментария';
        }
    }

    return `${count} ${word}`;
}

export default function VideoEngagement({ videoId, children }: Props) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [likesCount, setLikesCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [commentsCount, setCommentsCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [promptAuth, setPromptAuth] = useState(false);

    const commentFieldId = useId();
    const canComment = Boolean(user && !user.needs_username);

    useEffect(() => {
        const controller = new AbortController();

        fetchVideoEngagement(videoId, { signal: controller.signal })
            .then((engagement) => {
                if (controller.signal.aborted) {
                    return;
                }

                setLikesCount(engagement.likes_count);
                setLiked(engagement.liked);
                setComments(engagement.comments);
                setCommentsCount(engagement.comments_count);
                setHasMore(engagement.has_more);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                if (!controller.signal.aborted) {
                    setLoadError(true);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [videoId]);

    async function onToggleLike() {
        if (!user) {
            setPromptAuth(true);
            return;
        }

        if (isLiking) {
            return;
        }

        setIsLiking(true);
        const previousLiked = liked;
        const previousCount = likesCount;
        setLiked(!previousLiked);
        setLikesCount(previousCount + (previousLiked ? -1 : 1));

        try {
            const result = previousLiked ? await unlikeVideo(videoId) : await likeVideo(videoId);
            setLiked(result.liked);
            setLikesCount(result.likes_count);
        } catch {
            setLiked(previousLiked);
            setLikesCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    }

    async function onLoadMore() {
        const oldest = comments.at(-1);

        if (!oldest || isLoadingMore || !hasMore) {
            return;
        }

        setIsLoadingMore(true);

        try {
            const page = await fetchVideoEngagement(videoId, { before: oldest.id });
            setComments((current) => [...current, ...page.comments]);
            setCommentsCount(page.comments_count);
            setHasMore(page.has_more);
        } catch {
            setHasMore(true);
        } finally {
            setIsLoadingMore(false);
        }
    }

    async function onSubmitComment(event: FormEvent) {
        event.preventDefault();

        if (!canComment || isSubmitting) {
            return;
        }

        const nextBody = body.trim();
        if (nextBody === '') {
            setFormError('Напишите комментарий.');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const comment = await createComment(videoId, nextBody);
            setComments((current) => [comment, ...current]);
            setCommentsCount((current) => current + 1);
            setBody('');
        } catch (error) {
            setFormError(
                error instanceof EngagementApiError
                    ? error.message
                    : 'Не удалось отправить комментарий',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function onDeleteComment(commentId: number) {
        const previous = comments;
        const previousCount = commentsCount;
        setComments((current) => current.filter((comment) => comment.id !== commentId));
        setCommentsCount((current) => Math.max(0, current - 1));

        try {
            await deleteComment(commentId);
        } catch {
            setComments(previous);
            setCommentsCount(previousCount);
        }
    }

    return (
        <div className="video-engagement">
            <div className="video-engagement__media">
                {children}

                <div className="video-engagement__toolbar">
                    <button
                        type="button"
                        className={`video-engagement__like${liked ? ' is-active' : ''}`}
                        aria-pressed={liked}
                        aria-label={liked ? 'Убрать лайк' : 'Нравится'}
                        onClick={() => {
                            void onToggleLike();
                        }}
                        disabled={isLiking}
                    >
                        {liked ? (
                            <FaHeart className="video-engagement__like-icon" aria-hidden="true" />
                        ) : (
                            <FaRegHeart
                                className="video-engagement__like-icon"
                                aria-hidden="true"
                            />
                        )}
                        <span>{likesCount}</span>
                    </button>
                    <p className="video-engagement__count">{formatCommentsCount(commentsCount)}</p>
                </div>

                <div className="video-engagement__composer">
                    {user && canComment ? (
                        <form className="video-engagement__form" onSubmit={onSubmitComment}>
                            {formError ? (
                                <p className="video-engagement__error">{formError}</p>
                            ) : null}
                            <div className="video-engagement__field">
                                <label
                                    className="video-engagement__field-label"
                                    htmlFor={commentFieldId}
                                >
                                    Комментарий
                                </label>
                                <div className="video-engagement__field-box">
                                    <textarea
                                        id={commentFieldId}
                                        value={body}
                                        maxLength={2000}
                                        rows={2}
                                        placeholder="Напишите здесь что-нибудь"
                                        onChange={(event) => setBody(event.target.value)}
                                        required
                                    />
                                    <button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Отправляем…' : 'Отправить'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : null}

                    {user?.needs_username ? (
                        <div className="video-engagement__guest">
                            <p>Чтобы оставить комментарий, укажите имя в профиле.</p>
                            <div className="video-engagement__guest-actions">
                                <Link to="/complete-profile" className="video-engagement__cta">
                                    Указать имя
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    {!isAuthLoading && !user ? (
                        <div
                            className={`video-engagement__guest${promptAuth ? ' is-highlighted' : ''}`}
                            role="note"
                        >
                            <p>Чтобы оставить комментарий, необходимо зарегистрироваться</p>
                            <div className="video-engagement__guest-actions">
                                <Link to="/register" className="video-engagement__cta">
                                    Регистрация
                                </Link>
                                <Link to="/login" className="video-engagement__secondary">
                                    Войти
                                </Link>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <section className="video-engagement__comments" aria-label="Комментарии">
                <h3 className="video-engagement__heading">Комментарии</h3>

                <div className="video-engagement__feed">
                    {isLoading ? (
                        <p className="video-engagement__status">Загружаем комментарии…</p>
                    ) : null}
                    {loadError ? (
                        <p className="video-engagement__status">
                            Не удалось загрузить комментарии.
                        </p>
                    ) : null}

                    {!isLoading && !loadError && commentsCount === 0 ? (
                        <p className="video-engagement__status">Пока нет комментариев.</p>
                    ) : null}

                    {comments.length > 0 ? (
                        <ul className="video-engagement__list">
                            {comments.map((comment) => {
                                const canDelete =
                                    user !== null &&
                                    (user.id === comment.user.id || user.role === 'admin');

                                return (
                                    <li key={comment.id} className="video-engagement__item">
                                        <div className="video-engagement__item-top">
                                            <strong>{publicName(comment.user)}</strong>
                                            {comment.created_at ? (
                                                <time dateTime={comment.created_at}>
                                                    {formatCommentDate(comment.created_at)}
                                                </time>
                                            ) : null}
                                        </div>
                                        <p>{comment.body}</p>
                                        {canDelete ? (
                                            <button
                                                type="button"
                                                className="video-engagement__delete"
                                                onClick={() => {
                                                    void onDeleteComment(comment.id);
                                                }}
                                            >
                                                Удалить
                                            </button>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : null}

                    {hasMore ? (
                        <button
                            type="button"
                            className="video-engagement__more"
                            onClick={() => {
                                void onLoadMore();
                            }}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? 'Загружаем…' : 'Ещё комментарии'}
                        </button>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
