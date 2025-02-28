FROM php:8.1-apache

WORKDIR /var/www/html

# Install PHP extensions (only what's needed)
RUN apt-get update && apt-get install -y \
    unzip curl git libpq-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev zlib1g-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip gd mysqli \
    && rm -rf /var/lib/apt/lists/*  # Clean up unused files

# Install Redis Extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# Install Composer & Optimize Autoloader
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader --classmap-authoritative

# Copy application source code
COPY src/ /var/www/html/

# Enable Apache modules & restart service
RUN a2enmod rewrite

EXPOSE 80

CMD ["apache2-foreground"]
