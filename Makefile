up:
	docker compose up -d

build:
	docker compose up --build -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

shell:
	docker compose exec php sh

migrate:
	docker compose exec php php artisan migrate

clear:
	docker compose exec php php artisan optimize:clear

composer:
	docker compose exec php composer install