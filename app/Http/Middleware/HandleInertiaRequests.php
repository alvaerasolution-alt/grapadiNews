<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames()->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                    'points' => $user->points ?? 0,
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'mgidAds' => [
                'siteId' => env('MGID_SITE_ID'),
                'widgets' => [
                    'article_top' => env('MGID_WIDGET_ARTICLE_TOP'),
                    'article_bottom' => env('MGID_WIDGET_ARTICLE_BOTTOM'),
                    'article_sidebar' => env('MGID_WIDGET_ARTICLE_SIDEBAR'),
                    'home_hero_below' => env('MGID_WIDGET_HOME_HERO_BELOW'),
                    'home_sidebar' => env('MGID_WIDGET_HOME_SIDEBAR'),
                    'home_feed_inline' => env('MGID_WIDGET_HOME_FEED_INLINE'),
                    'home_mid_section' => env('MGID_WIDGET_HOME_MID_SECTION'),
                    'category_top' => env('MGID_WIDGET_CATEGORY_TOP'),
                    'category_sidebar' => env('MGID_WIDGET_CATEGORY_SIDEBAR'),
                ],
            ],
            'webSettings' => Setting::getWebSettings(),
            'navCategories' => cache()->remember('nav_categories', 3600, fn () => Category::orderBy('name')->get(['id', 'name', 'slug'])),
        ];
    }
}
