<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends Controller
{
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($comment->user_id !== $user->id && ! $user->isAdmin()) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $comment->delete();

        return response()->json([
            'data' => null,
        ]);
    }
}
