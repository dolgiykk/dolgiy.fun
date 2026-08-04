<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlatformResource;
use App\Services\PlatformCache;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlatformController extends Controller
{
    public function index(PlatformCache $platformCache): AnonymousResourceCollection
    {
        return PlatformResource::collection($platformCache->activePlatforms());
    }
}
