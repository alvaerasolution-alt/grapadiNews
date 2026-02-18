<?php

use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminPostController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\RedemptionItemController;
use App\Http\Controllers\Admin\RedemptionRequestController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\BannerClickController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PublicCategoryController;
use App\Http\Controllers\PublicPostController;
use App\Http\Controllers\RedemptionController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

// Banner click tracking
Route::post('/banners/{banner}/click', BannerClickController::class)->name('banners.click');

// Public pages
Route::get('/', [PublicPostController::class, 'index'])->name('home');
Route::get('/category/{category:slug}', [PublicCategoryController::class, 'show'])->name('category.show');
Route::get('/search', [SearchController::class, 'search'])->name('search');

// Legacy redirect: /article/{slug} -> /{slug} (301 for SEO)
Route::get('/article/{slug}', fn (string $slug) => redirect("/{$slug}", 301));

// Contributor dashboard
Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('media/upload', [MediaController::class, 'store'])->name('media.upload');
    Route::resource('posts', PostController::class);

    // Redemption routes
    Route::get('redemptions', [RedemptionController::class, 'index'])->name('redemptions.index');
    Route::get('redemptions/history', [RedemptionController::class, 'history'])->name('redemptions.history');
    Route::get('redemptions/{redemptionItem}/create', [RedemptionController::class, 'create'])->name('redemptions.create');
    Route::post('redemptions/{redemptionItem}', [RedemptionController::class, 'store'])->name('redemptions.store');
});

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('posts', [AdminPostController::class, 'index'])->name('posts.index');
        Route::get('posts/{post:slug}', [AdminPostController::class, 'show'])->name('posts.show');
        Route::patch('posts/{post:slug}/status', [AdminPostController::class, 'updateStatus'])->name('posts.update-status');
        Route::delete('posts/{post:slug}', [AdminPostController::class, 'destroy'])->name('posts.destroy');

        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('tags', TagController::class)->except(['show']);

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::patch('users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');

        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

        // Banner management
        Route::resource('banners', AdminBannerController::class)->except(['show']);

        // Redemption items CRUD
        Route::resource('redemption-items', RedemptionItemController::class)->except(['show']);

        // Redemption requests management
        Route::get('redemption-requests', [RedemptionRequestController::class, 'index'])->name('redemption-requests.index');
        Route::get('redemption-requests/{redemptionRequest}', [RedemptionRequestController::class, 'show'])->name('redemption-requests.show');
        Route::patch('redemption-requests/{redemptionRequest}/status', [RedemptionRequestController::class, 'updateStatus'])->name('redemption-requests.update-status');
    });

require __DIR__.'/settings.php';

// Fallback route: Article show (must be last to avoid conflicts with other routes)
Route::get('/{post:slug}', [PublicPostController::class, 'show'])->name('article.show');
