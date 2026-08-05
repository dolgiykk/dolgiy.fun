#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

COMPOSE=(docker compose -f docker-compose.prod.yml)

if [[ ! -f deploy/env/backend.env ]]; then
    echo "Missing deploy/env/backend.env. Copy deploy/env/backend.env.example and set APP_KEY / DB password." >&2
    exit 1
fi

if [[ ! -f .env ]]; then
    echo "Missing root .env for compose DB vars. Copy deploy/env/compose.env.example to .env." >&2
    exit 1
fi

echo "==> Building and starting production stack"
"${COMPOSE[@]}" build --pull
"${COMPOSE[@]}" up -d --remove-orphans

echo "==> Waiting for PHP container"
for _ in $(seq 1 30); do
    if "${COMPOSE[@]}" exec -T php php -v >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

echo "==> Running migrations and platform seed"
"${COMPOSE[@]}" exec -T php php artisan migrate --force
"${COMPOSE[@]}" exec -T php php artisan db:seed --force --class='Database\Seeders\PlatformSeeder'

echo "==> Caching Laravel config/routes/views"
"${COMPOSE[@]}" exec -T php php artisan optimize

echo "==> Health check"
curl -fsS "http://127.0.0.1:8080/api/health" | grep -q '"status":"ok"'
curl -fsS -o /dev/null -w "%{http_code}" "http://127.0.0.1:8080/" | grep -qE '200|304'

echo
echo "==> Deploy finished successfully"
"${COMPOSE[@]}" ps
