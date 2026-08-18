<?php

namespace App\Support;

final class VideoId
{
    public const PATTERN = '[A-Za-z0-9_-]{8,64}';

    public const RULE = 'required|string|regex:/^[A-Za-z0-9_-]{8,64}$/';
}
