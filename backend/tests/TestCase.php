<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $headers
     */
    public function json($method, $uri, array $data = [], array $headers = [], $options = 0)
    {
        $headers = array_merge([
            'Origin' => 'http://localhost:5173',
            'Referer' => 'http://localhost:5173/',
        ], $headers);

        return parent::json($method, $uri, $data, $headers, $options);
    }

    /**
     * @param  array<string, string>  $headers
     */
    public function get($uri, array $headers = [])
    {
        $headers = array_merge([
            'Origin' => 'http://localhost:5173',
            'Referer' => 'http://localhost:5173/',
        ], $headers);

        return parent::get($uri, $headers);
    }
}
