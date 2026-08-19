<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class VideoEngagementController extends Controller
{
    private const DEFAULT_COMMENT_LIMIT = 5;

    private const MAX_COMMENT_LIMIT = 20;

    public function show(Request $request, string $video): JsonResponse
    {
        $user = $request->user();
        $limit = min(self::MAX_COMMENT_LIMIT, max(1, $request->integer('limit', self::DEFAULT_COMMENT_LIMIT)));
        $before = $request->query('before');
        $beforeId = is_numeric($before) ? (int) $before : null;
        $page = $this->commentPage($video, $beforeId, $limit + 1);
        $hasMore = $page->count() > $limit;
        $comments = $page->take($limit)->values();

        return response()->json([
            'data' => [
                'likes_count' => $this->likesCount($video),
                'liked' => $user instanceof User && $this->userLiked($user, $video),
                'comments_count' => Comment::query()->where('video_id', $video)->count(),
                'has_more' => $hasMore,
                'comments' => CommentResource::collection($comments),
            ],
        ]);
    }

    public function like(Request $request, string $video): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        Like::query()->firstOrCreate([
            'user_id' => $user->id,
            'video_id' => $video,
        ]);

        return response()->json([
            'data' => [
                'liked' => true,
                'likes_count' => $this->likesCount($video),
            ],
        ]);
    }

    public function unlike(Request $request, string $video): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        Like::query()
            ->where('user_id', $user->id)
            ->where('video_id', $video)
            ->delete();

        return response()->json([
            'data' => [
                'liked' => false,
                'likes_count' => $this->likesCount($video),
            ],
        ]);
    }

    public function storeComment(StoreCommentRequest $request, string $video): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->needsUsername()) {
            return response()->json([
                'message' => 'Сначала укажите имя в профиле.',
                'errors' => [
                    'username' => ['Сначала укажите имя в профиле.'],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        /** @var string $body */
        $body = $request->validated('body');

        $comment = $user->comments()->create([
            'video_id' => $video,
            'body' => $body,
        ]);

        $comment->load('user');

        return response()->json([
            'data' => new CommentResource($comment),
        ], Response::HTTP_CREATED);
    }

    /**
     * @return Collection<int, Comment>
     */
    private function commentPage(string $video, ?int $beforeId, int $limit): Collection
    {
        return Comment::query()
            ->with('user')
            ->where('video_id', $video)
            ->when($beforeId !== null, static fn ($query) => $query->where('id', '<', $beforeId))
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    private function likesCount(string $video): int
    {
        return Like::query()->where('video_id', $video)->count();
    }

    private function userLiked(User $user, string $video): bool
    {
        return Like::query()
            ->where('user_id', $user->id)
            ->where('video_id', $video)
            ->exists();
    }
}
