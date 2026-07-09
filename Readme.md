# dolgiy.fun

Personal website, VPN management platform and infrastructure playground.

## Stack

### Backend

* PHP 8.4
* Laravel
* PostgreSQL 17
* Redis 8

### Frontend

* React
* TypeScript
* Vite

### Infrastructure

* Docker
* Docker Compose
* Nginx
* GitHub Actions

---

## Requirements

* Docker
* Docker Compose
* Git

---

## Installation

Clone repository:

```bash
git clone git@github.com:dolgiykk/dolgiy.fun.git
cd dolgiy.fun
```

Copy environment:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Build and start the project:

```bash
make build
make up
```

---

## Development

### Backend

Laravel:

http://localhost:8080

### Frontend

React + Vite:

http://localhost:5173

---

## Useful commands

| Command              | Description                  |
|----------------------| ---------------------------- |
| `make help`          | Show all available commands  |
| `make build`         | Build Docker images          |
| `make up`            | Start containers             |
| `make down`          | Stop containers              |
| `make restart`       | Restart containers           |
| `make logs`          | Show application logs        |
| `make ps`            | Show running containers      |
| `make bash_php`      | Enter PHP container          |
| `make bash_frontend` | Enter frontend container     |
| `make migrate`       | Run Laravel migrations       |
| `make lint`          | Run Laravel Pint + PHPStan   |
| `make fix`           | Automatically fix code style |
| `make stan`          | Run PHPStan                  |
| `make pint`          | Run Laravel Pint             |
| `make test`          | Run Laravel tests            |

---

## Code Quality

Backend:

* Laravel Pint
* PHPStan
* Git pre-commit hooks
* GitHub Actions

Frontend:

* ESLint
* Prettier

---

## Continuous Integration

Every push to GitHub automatically runs:

* Laravel Pint
* PHPStan

---

