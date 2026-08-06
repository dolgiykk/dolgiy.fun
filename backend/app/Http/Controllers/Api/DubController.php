<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LatestDubCache;
use Illuminate\Http\JsonResponse;

class DubController extends Controller
{
    public function index(LatestDubCache $latestDubCache): JsonResponse
    {
        return response()->json([
            'data' => $latestDubCache->catalog(),
        ]);
    }
}
