<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    public function notice(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'data' => [
                    'message' => 'Email already verified.',
                ],
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'data' => [
                'message' => 'Verification link sent.',
            ],
        ]);
    }

    public function verify(Request $request, string $id, string $hash): RedirectResponse|JsonResponse
    {
        if (! URL::hasValidSignature($request)) {
            abort(403, 'Invalid or expired verification link.');
        }

        $user = User::query()->findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'Invalid verification hash.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        $frontend = rtrim((string) config('app.frontend_url'), '/');

        if ($request->expectsJson()) {
            return response()->json([
                'data' => [
                    'message' => 'Email verified.',
                ],
            ]);
        }

        return redirect()->away("{$frontend}/account?verified=1");
    }
}
