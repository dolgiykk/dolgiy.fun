<?php

namespace App\Http\Resources;

use App\Models\Platform;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Platform
 */
class PlatformResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, bool|int|string|null>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'url' => $this->url,
            'icon' => $this->icon,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}
