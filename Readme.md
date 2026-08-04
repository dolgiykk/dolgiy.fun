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
* `.github/workflows/quality.yml` runs backend and frontend quality checks in CI.

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
* Vite production build

