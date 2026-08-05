<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LatestDubCache;
use Illuminate\Http\JsonResponse;

class LatestDubController extends Controller
{
    public function show(LatestDubCache $latestDubCache): JsonResponse
    {
        $latest = $latestDubCache->latest();

        if ($latest === null) {
            return response()->json([
                'data' => null,
            ]);
        }

        return response()->json([
            'data' => $latest,
        ]);
    }
}
