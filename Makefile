.PHONY: help \
	up build rebuild down restart logs ps \
	shell_php shell_frontend \
	install composer composer-update artisan \
	migrate fresh seed \
	lint fix \
	backend-lint backend-fix stan pint test \
	frontend-lint frontend-fix frontend-format \
	npm-install npm-dev npm-build \
	clear cache-clear


help: ## Show commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS=":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


# ==========================
# Docker
# ==========================

up: ## Start containers
	docker compose up -d


build: ## Build containers
	docker compose up --build -d


rebuild: ## Rebuild containers from scratch
	docker compose down
	docker compose up --build -d


down: ## Stop containers
	docker compose down


restart: ## Restart containers
	docker compose restart


logs: ## Follow container logs
	docker compose logs -f


ps: ## List containers
	docker compose ps



# ==========================
# Shell
# ==========================

shell_php: ## Enter PHP container
	docker compose exec php sh


shell_frontend: ## Enter frontend container
	docker compose exec frontend sh



# ==========================
# Installation
# ==========================

install: ## Install backend and frontend dependencies
	docker compose exec php composer install
	docker compose exec frontend npm install



# ==========================
# Backend
# ==========================

composer: ## Composer install
	docker compose exec php composer install


composer-update: ## Composer update
	docker compose exec php composer update


artisan: ## Run artisan command (usage: make artisan CMD="route:list")
	docker compose exec php php artisan $(CMD)


migrate: ## Run database migrations
	docker compose exec php php artisan migrate


fresh: ## Fresh database with seed
	docker compose exec php php artisan migrate:fresh --seed


seed: ## Run database seeders
	docker compose exec php php artisan db:seed


backend-lint: ## Backend code style and static analysis
	docker compose exec php composer lint


backend-fix: ## Fix backend code style
	docker compose exec php composer fix


stan: ## Run PHPStan
	docker compose exec php composer stan


pint: ## Run Laravel Pint
	docker compose exec php vendor/bin/pint


test: ## Run PHPUnit tests
	docker compose exec php php artisan test



# ==========================
# Frontend
# ==========================

npm-install: ## Install frontend dependencies
	docker compose exec frontend npm install


npm-dev: ## Start Vite dev server
	docker compose exec frontend npm run dev


npm-build: ## Build frontend
	docker compose exec frontend npm run build


frontend-lint: ## Frontend lint (oxlint + eslint + prettier)
	docker compose exec frontend npm run lint:all


frontend-fix: ## Fix frontend lint issues
	docker compose exec frontend npm run lint:fix


frontend-format: ## Format frontend files
	docker compose exec frontend npm run format



# ==========================
# Global checks
# ==========================

lint: ## Run all project checks
	make backend-lint
	make frontend-lint


fix: ## Fix all project code style issues
	make backend-fix
	make frontend-fix



# ==========================
# Laravel cache
# ==========================

clear: ## Clear Laravel caches
	docker compose exec php php artisan optimize:clear


cache-clear: ## Clear Laravel cache
	docker compose exec php php artisan cache:clear