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
                'display_name' => filled($user->username)
                    ? $user->display_name
                    : $profile['display_name'],
            ]);
            $user->save();

            return $user;
        }

        if ($email !== null) {
            $user = User::query()->where('email', $email)->first();
        }

        if ($user !== null) {
            if ($user->vk_id !== null && $user->vk_id !== $vkId) {
                throw ValidationException::withMessages([
                    'access_token' => ['Этот email уже привязан к другому VK-аккаунту.'],
                ]);
            }

            $user->fill([
                'vk_id' => $vkId,
                'avatar_url' => $profile['avatar_url'] ?? $user->avatar_url,
                'display_name' => $user->display_name ?? $profile['display_name'],
            ]);
            $user->save();

            return $user;
        }

        return User::query()->create([
            'vk_id' => $vkId,
            'username' => null,
            'display_name' => $profile['display_name'],
            'email' => $email,
            'email_verified_at' => null,
            'password' => Str::password(32),
            'role' => UserRole::User,
            'avatar_url' => $profile['avatar_url'],
        ]);
    }

    /**
     * @return array{vk_id: int, email: string|null, display_name: string, avatar_url: string|null}
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
        $rawEmail = strtolower(trim((string) data_get($payload, 'user.email', '')));
        $email = filter_var($rawEmail, FILTER_VALIDATE_EMAIL) ? $rawEmail : null;
        $avatar = data_get($payload, 'user.avatar');
        $displayName = $this->displayName(
            (string) data_get($payload, 'user.first_name', ''),
            (string) data_get($payload, 'user.last_name', ''),
        );

        if ($vkId < 1) {
            throw ValidationException::withMessages([
                'access_token' => ['Не удалось получить профиль VK.'],
            ]);
        }

        if ($displayName === '') {
            throw ValidationException::withMessages([
                'access_token' => ['VK не передал имя профиля.'],
            ]);
        }

        return [
            'vk_id' => $vkId,
            'email' => $email,
            'display_name' => $displayName,
            'avatar_url' => is_string($avatar) && $avatar !== '' ? $avatar : null,
        ];
    }

    private function displayName(string $firstName, string $lastName): string
    {
        $name = trim(preg_replace('/\s+/', ' ', $firstName.' '.$lastName) ?? '');

        return Str::limit($name, 80, '');
    }
}
