# cPanel Deployment Guide - Fix Vite ERR_CONNECTION_REFUSED

## Masalah

Laravel di production (cPanel) masih mencoba connect ke Vite dev server `127.0.0.1:5173` padahal sudah build.

## Penyebab

1. `APP_ENV` masih `local` bukan `production`
2. Folder `public_html/build` tidak ada atau tidak lengkap
3. Laravel cache masih menyimpan referensi ke dev server

## Solusi

### Step 1: Build Assets di Local

```bash
npm run build
```

### Step 2: Upload ke cPanel

Upload folder dan file berikut ke cPanel:

**Wajib Upload:**

1. Folder `public/build/` → `public_html/build/`
2. File `.env.production` → rename jadi `.env` di root cPanel
3. File `cpanel-fix.php` → `public_html/cpanel-fix.php`

**Struktur di cPanel harus seperti ini:**

```
/home/username/
├── .env                    # File .env.production yang sudah direname
├── vendor/                 # Folder vendor (sudah ada)
├── public_html/
│   ├── index.php          # Sudah ada
│   ├── build/             # Upload folder ini dari local
│   │   ├── manifest.json
│   │   └── assets/
│   │       └── ... (semua file JS/CSS)
│   └── cpanel-fix.php     # Upload file ini
```

### Step 3: Edit .env di cPanel

Edit file `.env` di root cPanel (bukan di public_html):

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://grapadinews.co.id  # Ganti dengan domain Anda

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database_anda
DB_USERNAME=username_database_anda
DB_PASSWORD=password_database_anda
```

### Step 4: Run Fix Script

Buka browser dan akses:

```
https://grapadinews.co.id/cpanel-fix.php
```

Script ini akan:

- Clear config cache
- Clear application cache
- Clear view cache
- Clear route cache
- Check status build folder

### Step 5: Hapus Fix Script (IMPORTANT!)

Setelah berhasil, hapus file `cpanel-fix.php` demi keamanan:

```bash
# Via File Manager cPanel, delete file:
public_html/cpanel-fix.php
```

### Step 6: Test

Buka website Anda:

- https://grapadinews.co.id/ (Homepage)
- https://grapadinews.co.id/login (Login page)

**Jika masih error**, coba:

1. Clear browser cache (Ctrl+F5)
2. Check browser console untuk error
3. Check file `public_html/build/manifest.json` ada

## Troubleshooting

### Error: "manifest.json not found"

**Solusi:** Pastikan folder `public_html/build/` di-upload lengkap dengan `manifest.json`

### Error: "vendor folder not found"

**Solusi:** File `cpanel-fix.php` harus di-upload ke `public_html/`, bukan ke root

### Error: "Permission denied"

**Solusi:** Set permission folder:

- `public_html/build/` → 755
- `public_html/build/assets/` → 644

### Vite masih load localhost:5173

**Solusi:** Pastikan `APP_ENV=production` di file `.env` (bukan `.env.example`)

## Alternative: Manual Blade Fix

Jika Vite tetap tidak mau load build, edit file:
`resources/views/app.blade.php`

Ganti:

```blade
@vite(['resources/js/app.tsx'])
```

Menjadi:

```blade
@if(app()->environment('production'))
    <link rel="stylesheet" href="{{ asset('build/assets/app-GnQEDAvk.css') }}" />
    <script type="module" src="{{ asset('build/assets/app-B0GGNOWA.js') }}"></script>
@else
    @vite(['resources/js/app.tsx'])
@endif
```

**Catatan:** Sesuaikan nama file CSS/JS dengan isi `public/build/manifest.json`

## Checklist

- [ ] Folder `public_html/build/` di-upload lengkap
- [ ] File `.env` diubah: `APP_ENV=production`
- [ ] Script `cpanel-fix.php` dijalankan
- [ ] Script `cpanel-fix.php` dihapus setelah fix
- [ ] Website bisa diakses tanpa error 5173

## Support

Jika masih bermasalah, check:

1. Laravel log: `storage/logs/laravel.log`
2. Browser console (F12 → Console)
3. Network tab untuk lihat file yang gagal load
