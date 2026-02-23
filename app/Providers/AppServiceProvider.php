<?php

namespace App\Providers;

use App\Models\Post;
use App\Models\Setting;
use App\Observers\PostObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Post::observe(PostObserver::class);

        // Share web settings with all blade views for favicon/SEO
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                View::share('webSettings', Setting::getWebSettings());
            }
        } catch (\Exception $e) {
            // Silently ignore during migrations or when DB doesn't exist
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
