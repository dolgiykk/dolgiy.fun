# dolgiy.fun

Personal website, VPN management platform and infrastructure playground.

## Stack

Backend:

* PHP 8.4
* Laravel 13
* PostgreSQL 17
* Redis 8

Frontend:

* React 19
* TypeScript
* Vite

Infrastructure:

* Docker
* Docker Compose
* Nginx
* GitHub Actions

## Project Layout

* `backend/` is the Laravel application and API backend.
* `frontend/` is the standalone React + Vite SPA.
* `deploy/docker/` contains Dockerfiles and service configuration for PHP, frontend, nginx and local PHP settings.
* `docker-compose.prod.yml` runs the production stack (nginx + PHP-FPM + Postgres + Redis).
* `.github/workflows/quality.yml` runs backend and frontend quality checks in CI.
* `.github/workflows/deploy.yml` deploys to the server over SSH after quality checks.

The Laravel backend still keeps its own Vite/Tailwind skeleton files for Laravel views. The standalone user-facing SPA lives in `frontend/`.

## Requirements

* Docker
* Docker Compose
* Git

## Installation

Clone repository:

```bash
git clone git@github.com:dolgiykk/dolgiy.fun.git
cd dolgiy.fun
```

Copy environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Build and start services:

```bash
make build
make up
```

## Local URLs

* Backend via nginx: http://localhost:8080
* API health check: http://localhost:8080/api/health
* Frontend dev server: http://localhost:5173

## Useful Commands

* `make help` shows all available commands.
* `make build` builds and starts Docker services.
* `make up` starts containers.
* `make down` stops containers.
* `make logs` follows container logs.
* `make shell_php` opens a shell in the PHP container.
* `make shell_frontend` opens a shell in the frontend container.
* `make migrate` runs Laravel migrations.
* `make test` runs Laravel tests.
* `make lint` runs backend and frontend checks.
* `make fix` applies backend and frontend code style fixes.

## Code Quality

Backend checks:

* Composer validate
* Laravel Pint
* PHPStan
* PHPUnit

Frontend checks:

* Oxlint
* ESLint
* Prettier
* Vitest
* Vite production build

## Production Deploy

Production runs as Docker Compose behind the host nginx on `dolgiy.fun`.
Host nginx terminates TLS and proxies to `127.0.0.1:8080`.

### Server bootstrap (once)

1. Install Docker Engine + Compose plugin.
2. Clone the repository, for example to `/opt/dolgiy.fun`.
3. Create compose env:

```bash
cp deploy/env/compose.env.example .env
# set DB_PASSWORD
```

4. Create backend env:

```bash
cp deploy/env/backend.env.example deploy/env/backend.env
# set APP_KEY, DB_PASSWORD, APP_URL=https://dolgiy.fun
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
# put the value into APP_KEY=
```

5. First deploy:

```bash
./deploy/scripts/deploy.sh
```

6. Point host nginx to the app using [`deploy/nginx/dolgiy.fun.conf`](deploy/nginx/dolgiy.fun.conf), keep existing Let's Encrypt certs, then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

7. Verify:

* https://dolgiy.fun/
* https://dolgiy.fun/api/health

### GitHub Actions autodeploy

Create a GitHub Environment named `production` with secrets:

* `DEPLOY_HOST` — server IP/hostname
* `DEPLOY_USER` — SSH user
* `DEPLOY_SSH_KEY` — private key
* `DEPLOY_PATH` — absolute path to the repo on the server (`/opt/dolgiy.fun`)
* `DEPLOY_PORT` — SSH port (`22` if default)

Push to `master` (or run the Deploy workflow manually) to:

1. Run quality checks
2. SSH into the server
3. `git reset --hard origin/master`
4. Rebuild containers, migrate, seed platforms, optimize, health-check

Useful local/prod commands:

* `make prod-build`
* `make prod-up`
* `make prod-deploy`
* `make prod-logs`

