<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = (string) config('admin.email');
        $adminUsername = strtolower((string) config('admin.username'));
        $adminPassword = (string) config('admin.password');

        User::query()->updateOrCreate(
            ['email' => $adminEmail],
            [
                'username' => $adminUsername,
                'password' => Hash::make($adminPassword),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ],
        );
    }
}
