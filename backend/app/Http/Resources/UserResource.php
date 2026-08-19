<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'email' => $this->email,
            'role' => $this->role->value,
            'avatar_url' => $this->avatar_url,
            'email_verified_at' => $this->email_verified_at,
            'needs_username' => $this->needsUsername(),
        ];
    }
}
