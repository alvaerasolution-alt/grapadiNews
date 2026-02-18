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
            'googleAds' => [
                'publisherId' => Setting::get('google_adsense_publisher_id'),
                'slots' => [
                    'article_top' => Setting::get('google_ad_slot_article_top'),
                    'article_bottom' => Setting::get('google_ad_slot_article_bottom'),
                    'home_hero_below' => Setting::get('google_ad_slot_home_hero_below'),
                    'home_sidebar' => Setting::get('google_ad_slot_home_sidebar'),
                    'home_feed_inline' => Setting::get('google_ad_slot_home_feed_inline'),
                    'category_top' => Setting::get('google_ad_slot_category_top'),
                    'category_sidebar' => Setting::get('google_ad_slot_category_sidebar'),
                ],
            ],
            'navCategories' => cache()->remember('nav_categories', 3600, fn () => Category::orderBy('name')->get(['id', 'name', 'slug'])),
        ];
    }
}
