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
            'id' => data_get($this->resource, 'id'),
            'slug' => data_get($this->resource, 'slug'),
            'name' => data_get($this->resource, 'name'),
            'url' => data_get($this->resource, 'url'),
            'icon' => data_get($this->resource, 'icon'),
            'is_active' => data_get($this->resource, 'is_active'),
            'sort_order' => data_get($this->resource, 'sort_order'),
        ];
    }
}
