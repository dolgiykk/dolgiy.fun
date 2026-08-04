<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlatformResource;
use App\Models\Platform;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlatformController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $platforms = Platform::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return PlatformResource::collection($platforms);
    }
}
