<?php

/**
 * Emergency Fix Script for cPanel
 *
 * This script clears all Laravel caches and fixes Vite connection issues.
 * Upload this to your public_html folder and run it via browser.
 * Delete this file after use for security.
 */
try {
    require __DIR__.'/../vendor/autoload.php';

    $app = require_once __DIR__.'/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo '<h2>Laravel Cache Clear - Emergency Fix</h2>';
    echo '<pre>';

    // Clear config cache
    echo 'Clearing config cache... ';
    Artisan::call('config:clear');
    echo "Done\n";

    // Clear application cache
    echo 'Clearing application cache... ';
    Artisan::call('cache:clear');
    echo "Done\n";

    // Clear view cache
    echo 'Clearing view cache... ';
    Artisan::call('view:clear');
    echo "Done\n";

    // Clear route cache
    echo 'Clearing route cache... ';
    Artisan::call('route:clear');
    echo "Done\n";

    echo '</pre>';

    echo '<h3>Status Check:</h3>';
    echo '<ul>';
    echo '<li>APP_ENV: '.env('APP_ENV').'</li>';
    echo '<li>Build folder exists: '.(file_exists(__DIR__.'/build/manifest.json') ? 'YES ✓' : 'NO ✗').'</li>';
    echo '</ul>';

    echo '<h3>Next Steps:</h3>';
    echo '<ol>';
    echo '<li>Make sure .env file has APP_ENV=production</li>';
    echo '<li>Make sure public_html/build/ folder exists with manifest.json</li>';
    echo '<li>Delete this file after fixing (for security)</li>';
    echo '</ol>';

    echo "<p><a href='/'>Test Homepage</a> | <a href='/login'>Test Login</a></p>";

} catch (Exception $e) {
    echo '<h2>Error</h2>';
    echo '<p>'.$e->getMessage().'</p>';
    echo '<p>Make sure this file is in public_html folder and vendor folder exists.</p>';
}
