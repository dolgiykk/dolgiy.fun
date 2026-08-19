<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property string|null $username
 * @property string|null $display_name
 * @property string|null $email
 * @property string|null $avatar_url
 * @property string|null $avatar_disk
 * @property string|null $avatar_path
 * @property UserRole $role
 * @property int|null $vk_id
 */
#[Fillable(['username', 'display_name', 'email', 'password', 'role', 'avatar_url', 'avatar_disk', 'avatar_path', 'email_verified_at', 'vk_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function needsUsername(): bool
    {
        return blank($this->username) && blank($this->display_name);
    }

    public function publicName(): string
    {
        if (filled($this->username)) {
            return '@'.$this->username;
        }

        if (filled($this->display_name)) {
            return (string) $this->display_name;
        }

        return 'пользователь';
    }

    public function avatarUrl(): ?string
    {
        if (filled($this->avatar_path)) {
            return route('api.users.avatar.show', [
                'user' => $this,
                'v' => $this->updated_at?->format('Uu'),
            ]);
        }

        return $this->avatar_url;
    }

    public function canUploadAvatar(): bool
    {
        return blank($this->vk_id) || filled($this->username);
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return HasMany<Like, $this>
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function hasVerifiedEmail(): bool
    {
        return blank($this->email) || $this->email_verified_at !== null;
    }

    public function sendEmailVerificationNotification(): void
    {
        if (blank($this->email)) {
            return;
        }

        $this->notify(new VerifyEmailNotification);
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'vk_id' => 'integer',
        ];
    }
}
