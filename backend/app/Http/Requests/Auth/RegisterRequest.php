<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_]+$/', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('username')) {
            $this->merge([
                'username' => strtolower((string) $this->input('username')),
            ]);
        }
    }

    /**
     * @return array{username: string, email: string, password: string, role: UserRole}
     */
    public function validatedUserData(): array
    {
        /** @var array{username: string, email: string, password: string} $data */
        $data = $this->validated();

        return [
            ...$data,
            'role' => UserRole::User,
        ];
    }
}
