FROM php:8.1-apache

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends unzip curl git libpq-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev zlib1g-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql mysqli zip gd

RUN apt-get install -y libhiredis-dev && pecl install redis \
    && docker-php-ext-enable redis

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY --chown=www-data:www-data src/ /var/www/html/
COPY --chown=www-data:www-data composer.json composer.lock ./

RUN composer install --no-dev --optimize-autoloader --classmap-authoritative

RUN a2enmod rewrite

EXPOSE 80

CMD ["apache2-foreground"]
