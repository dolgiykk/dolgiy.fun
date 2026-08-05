<?php

return [
    'channel_id' => env('RUTUBE_CHANNEL_ID', '25340957'),
    'cache_store' => env('RUTUBE_CACHE_STORE', 'redis'),
    'cache_ttl_seconds' => (int) env('RUTUBE_CACHE_TTL', 3600),
];
