FROM php:8.4-fpm-alpine

# Рабочая директория
WORKDIR /var/www/html

# Системные зависимости
RUN apk add --no-cache \
    bash \
    curl \
    git \
    unzip \
    nano \
    vim \
    icu-dev \
    libzip-dev \
    postgresql-dev \
    oniguruma-dev \
    linux-headers \
    shadow \
    tzdata \
    $PHPIZE_DEPS

# PHP Extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    intl \
    bcmath \
    exif \
    pcntl \
    zip \
    opcache

# Redis
RUN pecl install redis \
    && docker-php-ext-enable redis

# Xdebug
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

CMD ["php-fpm"]