#!/bin/bash
set -e

echo "=== Ananas Fashion Backend — Starting ==="

# Cache configuration for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (safe for production — only pending ones)
php artisan migrate --force

# Create storage symlink if not exists
php artisan storage:link 2>/dev/null || true

# Update Apache port to match Render's $PORT
PORT=${PORT:-10000}
echo "Starting Apache on port $PORT"

sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
sed -i "s/:80/:$PORT/" /etc/apache2/sites-available/*.conf

# Start Apache in foreground
exec apache2-foreground

