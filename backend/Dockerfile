FROM php:8.1-apache

# Set working directory
WORKDIR /var/www/html

# Install required PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Install system dependencies and Composer in one step to optimize caching
RUN apt-get update && apt-get install -y unzip \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm -rf /var/lib/apt/lists/* composer-setup.php

# Copy backend source files
COPY --chown=www-data:www-data src/ /var/www/html/

# Copy Composer files and install dependencies
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Expose port for Apache
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
