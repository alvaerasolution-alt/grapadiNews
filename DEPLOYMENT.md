# GrapadiNews Deployment Guide

Panduan deployment aplikasi GrapadiNews ke production environment.

## Requirements

- PHP 8.2+
- MySQL/MariaDB 8.0+
- Node.js 18+ (untuk build assets)
- Composer 2.x

## Pre-Deployment Checklist

- [ ] Semua tests passed (`php artisan test`)
- [ ] TypeScript tidak ada error (`npm run types`)
- [ ] Code style sudah diformat (`vendor/bin/pint`)
- [ ] Production assets sudah di-build (`npm run build`)

---

## Deployment ke Shared Hosting

### Struktur Folder

```
/home/username/
├── grapadinews/              # Laravel app (di LUAR public_html)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   └── ...
│
└── public_html/              # Web root (document root)
    ├── index.php             # Modified dari public/index.php
    ├── .htaccess             # Copy dari public/.htaccess
    ├── build/                # Copy dari public/build/
    ├── storage -> ../grapadinews/storage/app/public  # Symlink
    └── favicon.ico
```

### Langkah Deployment

#### 1. Upload Files

Upload semua file KECUALI:

- `node_modules/`
- `vendor/`
- `.env` (akan dibuat di server)
- `storage/app/*` (kecuali `.gitignore`)
- `storage/logs/*`
- `storage/framework/cache/*`
- `storage/framework/sessions/*`
- `storage/framework/views/*`

#### 2. Install Dependencies di Server

```bash
cd ~/grapadinews
composer install --no-dev --optimize-autoloader
```

#### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi production:

```env
APP_NAME=GrapadiNews
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

LOG_STACK=daily
LOG_LEVEL=warning

QUEUE_CONNECTION=sync

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

#### 4. Generate Application Key

```bash
php artisan key:generate
```

#### 5. Setup public_html

**Option A: Via SSH (Recommended)**

```bash
# Copy public files
cp -r ~/grapadinews/public/* ~/public_html/

# Create storage symlink
ln -s ~/grapadinews/storage/app/public ~/public_html/storage
```

**Option B: Via File Manager**

1. Copy semua isi folder `public/` ke `public_html/`
2. Buat symlink manual atau copy folder `storage/app/public` ke `public_html/storage`

#### 6. Modify public_html/index.php

Edit `public_html/index.php`:

```php
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../grapadinews/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../grapadinews/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
$app = require_once __DIR__.'/../grapadinews/bootstrap/app.php';

$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
```

#### 7. Run Migrations

```bash
cd ~/grapadinews
php artisan migrate --force
```

#### 8. Seed Initial Data

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder --force
php artisan db:seed --class=CategorySeeder --force
php artisan db:seed --class=SettingsSeeder --force
```

#### 9. Set Permissions

```bash
chmod -R 775 ~/grapadinews/storage
chmod -R 775 ~/grapadinews/bootstrap/cache
```

#### 10. Optimize Laravel

```bash
php artisan optimize
php artisan view:cache
php artisan event:cache
```

---

## Deployment ke VPS/Dedicated Server

### Menggunakan Laravel Forge atau Manual

#### 1. Clone Repository

```bash
git clone <repository-url> /var/www/grapadinews
cd /var/www/grapadinews
```

#### 2. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build:ssr
```

#### 3. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
# Edit .env dengan konfigurasi production
```

#### 4. Database Setup

```bash
php artisan migrate --force
php artisan db:seed --class=RolesAndPermissionsSeeder --force
php artisan db:seed --class=CategorySeeder --force
php artisan db:seed --class=SettingsSeeder --force
```

#### 5. Storage Link

```bash
php artisan storage:link
```

#### 6. Permissions

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### 7. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/grapadinews/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 8. Queue Worker (Optional - untuk VPS)

```bash
# Supervisor config: /etc/supervisor/conf.d/grapadinews-worker.conf
[program:grapadinews-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/grapadinews/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/grapadinews/storage/logs/worker.log
stopwaitsecs=3600
```

#### 9. SSR (Optional - untuk VPS dengan Node.js)

```bash
# Supervisor config: /etc/supervisor/conf.d/grapadinews-ssr.conf
[program:grapadinews-ssr]
command=php /var/www/grapadinews/artisan inertia:start-ssr
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/grapadinews/storage/logs/ssr.log
```

#### 10. Optimize

```bash
php artisan optimize
php artisan view:cache
php artisan event:cache
```

---

## Post-Deployment

### Create Admin User

```bash
php artisan tinker
```

```php
$user = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@yourdomain.com',
    'password' => bcrypt('your-secure-password'),
    'email_verified_at' => now(),
]);
$user->assignRole('admin');
```

### Clear Caches (setelah update)

```bash
php artisan optimize:clear
php artisan optimize
```

---

## Troubleshooting

### 500 Internal Server Error

1. Check `storage/logs/laravel.log` untuk error detail
2. Pastikan permissions sudah benar (775 untuk storage dan bootstrap/cache)
3. Pastikan `.env` sudah dikonfigurasi dengan benar

### Assets Tidak Load

1. Pastikan folder `public/build/` sudah ada dan berisi hasil build
2. Jika di shared hosting, pastikan sudah copy ke `public_html/build/`
3. Run `npm run build` ulang jika perlu

### Database Connection Error

1. Verify credentials di `.env`
2. Pastikan database sudah dibuat
3. Test koneksi dengan: `php artisan tinker` lalu `DB::connection()->getPdo();`

### Storage/Upload Tidak Berfungsi

1. Pastikan symlink sudah dibuat: `php artisan storage:link`
2. Di shared hosting, buat symlink manual jika command tidak tersedia
3. Pastikan folder `storage/app/public` writable

---

## Security Checklist

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Strong `APP_KEY` (generated)
- [ ] HTTPS enabled
- [ ] `.env` file not accessible from web
- [ ] `storage/` and `bootstrap/cache/` not accessible from web
- [ ] Database credentials secure
- [ ] SMTP credentials secure
