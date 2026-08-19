<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class VkIdAuthService
{
    public function login(string $accessToken): User
    {
        $profile = $this->fetchProfile($accessToken);
        $vkId = $profile['vk_id'];
        $email = $profile['email'];

        $user = User::query()->where('vk_id', $vkId)->first();

        if ($user !== null) {
            $user->fill([
                'avatar_url' => $profile['avatar_url'] ?? $user->avatar_url,
            ]);
            $user->save();

            return $user;
        }

        $user = User::query()->where('email', $email)->first();

        if ($user !== null) {
            if ($user->vk_id !== null && $user->vk_id !== $vkId) {
                throw ValidationException::withMessages([
                    'access_token' => ['Этот email уже привязан к другому VK-аккаунту.'],
                ]);
            }

            $user->fill([
                'vk_id' => $vkId,
                'avatar_url' => $profile['avatar_url'] ?? $user->avatar_url,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
            $user->save();

            return $user;
        }

        return User::query()->create([
            'vk_id' => $vkId,
            'username' => null,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Str::password(32),
            'role' => UserRole::User,
            'avatar_url' => $profile['avatar_url'],
        ]);
    }

    /**
     * @return array{vk_id: int, email: string, avatar_url: string|null}
     */
    private function fetchProfile(string $accessToken): array
    {
        $appId = (int) config('vkid.app_id');

        if ($appId < 1) {
            throw ValidationException::withMessages([
                'access_token' => ['Вход через VK не настроен.'],
            ]);
        }

        try {
            $payload = Http::asForm()
                ->acceptJson()
                ->timeout(8)
                ->post((string) config('vkid.user_info_url'), [
                    'client_id' => $appId,
                    'access_token' => $accessToken,
                ])
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'access_token' => ['Не удалось проверить вход через VK.'],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'access_token' => ['Не удалось проверить вход через VK.'],
            ]);
        }

        if (! is_array($payload) || filled(data_get($payload, 'error'))) {
            throw ValidationException::withMessages([
                'access_token' => ['Не удалось проверить вход через VK.'],
            ]);
        }

        $vkId = (int) data_get($payload, 'user.user_id');
        $email = strtolower(trim((string) data_get($payload, 'user.email', '')));
        $avatar = data_get($payload, 'user.avatar');

        if ($vkId < 1) {
            throw ValidationException::withMessages([
                'access_token' => ['Не удалось получить профиль VK.'],
            ]);
        }

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'access_token' => ['VK не передал email. Разрешите доступ к почте и попробуйте снова.'],
            ]);
        }

        return [
            'vk_id' => $vkId,
            'email' => $email,
            'avatar_url' => is_string($avatar) && $avatar !== '' ? $avatar : null,
        ];
    }
}
