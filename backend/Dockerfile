FROM php:8.1-apache
WORKDIR /var/www/html
RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN apt-get update && apt-get install -y --no-install-recommends unzip curl git \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=www-data:www-data src/ /var/www/html/
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --classmap-authoritative
RUN a2enmod rewrite
EXPOSE 80
CMD ["apache2-foreground"]
