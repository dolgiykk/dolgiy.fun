<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VkAuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_vk_login_creates_user_without_username(): void
    {
        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => '100500',
                    'email' => 'fan@vk.example',
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
            ->assertJsonPath('data.email', 'fan@vk.example')
            ->assertJsonPath('data.username', null)
            ->assertJsonPath('data.needs_username', true)
            ->assertJsonPath('data.avatar_url', 'https://example.com/avatar.jpg');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'vk_id' => 100500,
            'email' => 'fan@vk.example',
            'username' => null,
        ]);
    }

    public function test_vk_login_reuses_existing_vk_user(): void
    {
        $user = User::factory()->create([
            'vk_id' => 100500,
            'email' => 'fan@vk.example',
            'username' => 'fan',
        ]);

        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => 100500,
                    'email' => 'fan@vk.example',
                    'avatar' => 'https://example.com/new.jpg',
                ],
            ]),
        ]);

        $this->postJson('/api/auth/vk', [
            'access_token' => str_repeat('b', 32),
        ])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.username', 'fan')
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
        $this->assertNotNull($fresh->email_verified_at);
    }

    public function test_vk_login_rejects_missing_email(): void
    {
        Http::fake([
            'id.vk.ru/oauth2/user_info' => Http::response([
                'user' => [
                    'user_id' => 100500,
                    'email' => '',
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
