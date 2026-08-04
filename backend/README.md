# dolgiy.fun Backend

Laravel API backend for `dolgiy.fun`.

## Responsibilities

* Serve Laravel web routes and health checks through nginx.
* Expose API endpoints under `/api`.
* Own database migrations, seeders, queues, cache and other backend concerns.
* Keep backend quality gates: Pint, PHPStan and PHPUnit.

## Runtime

* PHP 8.4
* Laravel 13
* PostgreSQL
* Redis

## Local Development

From the repository root:

```bash
make build
make up
```

Useful backend commands:

```bash
make shell_php
make migrate
make test
make backend-lint
make stan
make pint
```

## API

API routes live in `routes/api.php` and are mounted under `/api`.

Current public health endpoint:

```text
GET /api/health
```

Expected response:

```json
{
    "status": "ok"
}
```

CORS is configured in `config/cors.php`. Use `FRONTEND_URL` in `.env` to allow the local or deployed frontend origin. Multiple origins can be comma-separated.

## Frontend Tooling Note

This directory keeps Laravel's default Vite/Tailwind files for Blade assets in `resources/`. The standalone React SPA is intentionally separate and lives in `../frontend`.
