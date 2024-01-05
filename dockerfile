FROM php:apache

# Install required extensions
RUN docker-php-ext-install pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Add mysql extensions
RUN docker-php-ext-install mysqli pdo_mysql

# Enable mod_rewrite
RUN a2enmod rewrite 

# Allow overriding
RUN chown -R www-data:www-data /var/www/html