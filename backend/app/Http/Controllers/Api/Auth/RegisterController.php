<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request): JsonResponse
    {
        // #region agent log
        $debugLog = static function (string $message, array $data, string $hypothesisId = 'A'): void {
            $payload = [
                'sessionId' => 'de455e',
                'runId' => getenv('DEBUG_RUN_ID') ?: 'pre-fix',
                'hypothesisId' => $hypothesisId,
                'location' => 'RegisterController.php:store',
                'message' => $message,
                'data' => $data,
                'timestamp' => (int) (microtime(true) * 1000),
            ];
            $line = json_encode($payload, JSON_UNESCAPED_SLASHES)."\n";
            @file_put_contents(storage_path('logs/debug-de455e.log'), $line, FILE_APPEND);
            @file_put_contents('/home/konst/PhpstormProjects/dolgiy.fun/.cursor/debug-de455e.log', $line, FILE_APPEND);
            Log::info('[debug-de455e] '.$message, $data);
        };
        $debugLog('register.start', [
            'mailer' => (string) config('mail.default'),
            'mail_host' => (string) config('mail.mailers.smtp.host'),
            'mail_port' => (int) config('mail.mailers.smtp.port'),
            'resend_key_set' => filled(config('services.resend.key')),
            'mail_from' => (string) config('mail.from.address'),
            'mail_timeout' => config('mail.mailers.smtp.timeout'),
            'queue' => (string) config('queue.default'),
        ], 'A');
        // #endregion

        $user = User::query()->create($request->validatedUserData());

        // #region agent log
        $debugLog('register.user_created', ['user_id' => $user->id], 'B');
        $registeredStarted = microtime(true);
        // #endregion

        try {
            event(new Registered($user));
            // #region agent log
            $debugLog('register.registered_event_done', [
                'elapsed_ms' => (int) ((microtime(true) - $registeredStarted) * 1000),
                'mailer' => (string) config('mail.default'),
            ], 'A');
            // #endregion
        } catch (Throwable $e) {
            // #region agent log
            $debugLog('register.registered_event_failed', [
                'elapsed_ms' => (int) ((microtime(true) - $registeredStarted) * 1000),
                'exception' => $e::class,
                'error' => $e->getMessage(),
                'mailer' => (string) config('mail.default'),
            ], 'A');
            // #endregion
            throw $e;
        }

        // #region agent log
        $loginStarted = microtime(true);
        // #endregion

        Auth::login($user);
        $request->session()->regenerate();

        // #region agent log
        $debugLog('register.login_done', [
            'elapsed_ms' => (int) ((microtime(true) - $loginStarted) * 1000),
        ], 'C');
        // #endregion

        return response()->json([
            'data' => new UserResource($user),
        ], 201);
    }
}
