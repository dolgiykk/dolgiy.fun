<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VkAuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_vk_login_creates_user_with_display_name_without_email(): void
    {
        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => '100500',
                    'email' => '',
                    'avatar' => 'https://example.com/avatar.jpg',
                    'first_name' => 'Фан',
                    'last_name' => 'К',
                ],
            ]),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('a', 32),
        ])
            ->assertOk()
            ->assertJsonPath('data.email', null)
            ->assertJsonPath('data.username', null)
            ->assertJsonPath('data.display_name', 'Фан К')
            ->assertJsonPath('data.needs_username', false)
            ->assertJsonPath('data.email_verified_at', null)
            ->assertJsonPath('data.avatar_url', 'https://example.com/avatar.jpg');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'vk_id' => 100500,
            'email' => null,
            'username' => null,
            'display_name' => 'Фан К',
        ]);
    }

    public function test_vk_login_accepts_long_avatar_url(): void
    {
        $avatar = 'https://sun9-80.userapi.com/impg/'.str_repeat('a', 300).'/photo.jpg?size=400x400&quality=96&sign='.str_repeat('b', 80);

        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => 100501,
                    'first_name' => 'Фан',
                    'last_name' => 'К',
                    'avatar' => $avatar,
                ],
            ]),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('f', 32),
        ])
            ->assertOk()
            ->assertJsonPath('data.avatar_url', $avatar);

        $this->assertTrue(strlen($avatar) > 255);
    }

    public function test_vk_login_reuses_existing_vk_user(): void
    {
        $user = User::factory()->create([
            'vk_id' => 100500,
            'email' => null,
            'username' => null,
            'display_name' => 'Фан К',
        ]);

        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => 100500,
                    'first_name' => 'Фан',
                    'last_name' => 'К',
                    'avatar' => 'https://example.com/new.jpg',
                ],
            ]),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('b', 32),
        ])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.display_name', 'Фан К')
            ->assertJsonPath('data.needs_username', false);

        $this->assertSame(1, User::query()->count());
    }

    public function test_vk_login_links_existing_email_account(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'fan@example.com',
            'vk_id' => null,
            'username' => 'fan',
        ]);

        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => 777,
                    'email' => 'fan@example.com',
                    'first_name' => 'Фан',
                    'last_name' => 'К',
                ],
            ]),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('c', 32),
        ])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.needs_username', false);

        $fresh = $user->fresh();
        $this->assertSame(777, $fresh->vk_id);
        $this->assertNull($fresh->email_verified_at);
        $this->assertSame('fan', $fresh->username);
    }

    public function test_vk_user_with_display_name_can_comment(): void
    {
        $user = User::factory()->create([
            'username' => null,
            'display_name' => 'Фан К',
            'email' => null,
        ]);

        $this->actingAs($user)
            ->postJson('/api/videos/video-id/comments', [
                'body' => 'Класс',
            ])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Класс')
            ->assertJsonPath('data.user.display_name', 'Фан К')
            ->assertJsonPath('data.user.username', null);
    }

    public function test_vk_login_rejects_missing_name(): void
    {
        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => 100500,
                    'first_name' => '',
                    'last_name' => '',
                ],
            ]),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('d', 32),
        ])->assertUnprocessable();

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_vk_login_rejects_invalid_token(): void
    {
        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response(['error' => 'invalid_token'], 400),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('e', 32),
        ])->assertUnprocessable();

        $this->assertGuest();
    }
}
