<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use RuntimeException;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_fetch_profile(): void
    {
        $response = $this->postJson('/api/register', [
            'username' => 'dolgiy_fan',
            'email' => 'fan@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.username', 'dolgiy_fan')
            ->assertJsonPath('data.email', 'fan@example.com')
            ->assertJsonPath('data.role', 'user')
            ->assertJsonMissingPath('data.name');

        $this->assertAuthenticated();

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.username', 'dolgiy_fan');
    }

    public function test_registration_succeeds_without_frontend_origin_headers(): void
    {
        $this->call(
            'POST',
            '/api/register',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            json_encode([
                'username' => 'no_origin',
                'email' => 'no-origin@example.com',
                'password' => 'Password1!',
                'password_confirmation' => 'Password1!',
            ], JSON_THROW_ON_ERROR),
        )->assertCreated()
            ->assertJsonPath('data.username', 'no_origin');

        $this->assertDatabaseHas('users', [
            'email' => 'no-origin@example.com',
            'username' => 'no_origin',
        ]);
    }

    public function test_registration_rolls_back_when_verification_email_fails(): void
    {
        Event::listen(Registered::class, static function (): never {
            throw new RuntimeException('Unable to send verification email.');
        });

        $this->postJson('/api/register', [
            'username' => 'rollback_me',
            'email' => 'rollback@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertServerError();

        $this->assertDatabaseMissing('users', [
            'email' => 'rollback@example.com',
        ]);
    }

    public function test_registration_sends_verification_email_and_link_activates_user(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'username' => 'verify_me',
            'email' => 'verify@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertCreated()
            ->assertJsonPath('data.email_verified_at', null);

        $user = User::query()->where('email', 'verify@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmailNotification::class);

        $verificationUrl = URL::temporarySignedRoute(
            'api.verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ],
        );

        $this->get($verificationUrl)
            ->assertRedirect(rtrim((string) config('app.frontend_url'), '/').'/account?verified=1');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_user_can_login_and_logout(): void
    {
        User::factory()->create([
            'email' => 'fan@example.com',
            'password' => 'Password1!',
        ]);

        $this->postJson('/api/login', [
            'email' => 'fan@example.com',
            'password' => 'Password1!',
        ])->assertOk();

        $this->assertAuthenticated();

        $this->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('data', null);
    }

    public function test_user_can_update_username(): void
    {
        $user = User::factory()->create([
            'username' => 'old_name',
        ]);

        $this->actingAs($user)
            ->patchJson('/api/user', [
                'username' => 'new_name',
            ])
            ->assertOk()
            ->assertJsonPath('data.username', 'new_name');
    }

    public function test_password_reset_flow(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'fan@example.com',
        ]);

        $this->postJson('/api/forgot-password', [
            'email' => 'fan@example.com',
        ])->assertOk();

        Notification::assertSentTo($user, ResetPasswordNotification::class);

        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'fan@example.com',
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])->assertOk();

        $this->postJson('/api/login', [
            'email' => 'fan@example.com',
            'password' => 'NewPassword1!',
        ])->assertOk();
    }

    public function test_admin_role_is_exposed_on_user_endpoint(): void
    {
        $admin = User::factory()->admin()->create([
            'username' => 'admin',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.role', 'admin')
            ->assertJsonPath('data.username', 'admin');
    }
}
