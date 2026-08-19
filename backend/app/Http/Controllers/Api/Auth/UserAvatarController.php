<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UploadAvatarRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserAvatarController extends Controller
{
    public function store(UploadAvatarRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->canUploadAvatar()) {
            throw ValidationException::withMessages([
                'avatar' => ['Для аккаунта VK аватар подтягивается автоматически.'],
            ]);
        }

        $disk = (string) config('filesystems.avatar');
        $file = $request->file('avatar');
        $extension = $file?->guessExtension() ?: $file?->extension() ?: 'jpg';
        $path = $file?->storeAs(
            "avatars/{$user->id}",
            Str::uuid().'.'.$extension,
            ['disk' => $disk],
        );

        if ($path === null) {
            throw ValidationException::withMessages([
                'avatar' => ['Не удалось сохранить аватар.'],
            ]);
        }

        if (filled($user->avatar_path) && filled($user->avatar_disk)) {
            Storage::disk($user->avatar_disk)->delete($user->avatar_path);
        }

        $user->forceFill([
            'avatar_disk' => $disk,
            'avatar_path' => $path,
            'avatar_url' => null,
        ])->save();

        return response()->json([
            'data' => new UserResource($user->refresh()),
        ]);
    }

    public function show(User $user): StreamedResponse
    {
        if (blank($user->avatar_path)) {
            abort(404);
        }

        $disk = $user->avatar_disk ?: (string) config('filesystems.avatar');

        if (! Storage::disk($disk)->exists($user->avatar_path)) {
            abort(404);
        }

        return Storage::disk($disk)->response($user->avatar_path);
    }
}
