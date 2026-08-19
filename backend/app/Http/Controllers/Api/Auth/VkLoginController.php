<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VkLoginRequest;
use App\Http\Resources\UserResource;
use App\Services\VkIdAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class VkLoginController extends Controller
{
    public function store(VkLoginRequest $request, VkIdAuthService $vkIdAuth): JsonResponse
    {
        $user = $vkIdAuth->login((string) $request->validated('access_token'));

        Auth::login($user, remember: true);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'data' => new UserResource($user->refresh()),
        ]);
    }
}
