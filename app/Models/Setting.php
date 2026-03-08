<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'description',
        'group',
    ];

    // Default values for web settings
    public const DEFAULT_SITE_NAME = 'GrapadiNews';

    public const DEFAULT_SITE_TAGLINE = 'Platform berita dan artikel terkini, terpercaya, dan informatif untuk generasi digital Indonesia.';

    public const DEFAULT_FOOTER_TEXT = '© {year} GrapadiNews. All rights reserved.';

    public const DEFAULT_ABOUT_US = '';

    public const DEFAULT_DISCLAIMER = '';

    public const DEFAULT_PARTNERSHIP = '';

    /**
     * Scope for web settings.
     */
    public function scopeWeb($query)
    {
        return $query->where('group', 'web');
    }

    /**
     * Scope for ads settings.
     */
    public function scopeAds($query)
    {
        return $query->where('group', 'ads');
    }

    /**
     * Scope for points settings.
     */
    public function scopePoints($query)
    {
        return $query->where('group', 'points');
    }

    /**
     * Get all point system settings as array.
     */
    public static function getPointSettings(): array
    {
        return Cache::remember('settings.points', 3600, function () {
            $settings = static::points()->pluck('value', 'key')->toArray();

            return [
                'publish_points_enabled' => (bool) ($settings['publish_points_enabled'] ?? true),
                'points_per_publish' => (int) ($settings['points_per_publish'] ?? 10),
                'view_points_enabled' => (bool) ($settings['view_points_enabled'] ?? true),
                'views_per_point' => (int) ($settings['views_per_point'] ?? 5000),
                'max_points_per_article' => (int) ($settings['max_points_per_article'] ?? 10),
                'rupiah_per_point' => (int) ($settings['rupiah_per_point'] ?? 10000),
                'max_pending_requests' => (int) ($settings['max_pending_requests'] ?? 1),
                'redemption_cooldown_hours' => (int) ($settings['redemption_cooldown_hours'] ?? 24),
            ];
        });
    }

    /**
     * Get a setting value by key, with caching.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            [
                'value' => (string) $value,
                'group' => $group,
            ],
        );

        Cache::forget("setting.{$key}");
        Cache::forget("settings.{$group}");
    }

    /**
     * Get all web settings as array.
     */
    public static function getWebSettings(): array
    {
        return Cache::remember('settings.web', 3600, function () {
            $settings = static::web()->pluck('value', 'key')->toArray();

            $logo = $settings['site_logo'] ?? null;
            $favicon = $settings['favicon'] ?? null;

            return [
                'site_name' => $settings['site_name'] ?? self::DEFAULT_SITE_NAME,
                'site_logo' => $logo ? asset('storage/'.$logo) : null,
                'site_tagline' => $settings['site_tagline'] ?? self::DEFAULT_SITE_TAGLINE,
                'footer_text' => $settings['footer_text'] ?? self::DEFAULT_FOOTER_TEXT,
                'favicon' => $favicon ? asset('storage/'.$favicon).'?v='.time() : null,
                'social_facebook' => $settings['social_facebook'] ?? null,
                'social_instagram' => $settings['social_instagram'] ?? null,
                'social_twitter' => $settings['social_twitter'] ?? null,
                'social_youtube' => $settings['social_youtube'] ?? null,
                'social_tiktok' => $settings['social_tiktok'] ?? null,
                'social_linkedin' => $settings['social_linkedin'] ?? null,
                'about_us' => $settings['about_us'] ?? self::DEFAULT_ABOUT_US,
                'disclaimer' => $settings['disclaimer'] ?? self::DEFAULT_DISCLAIMER,
                'partnership' => $settings['partnership'] ?? self::DEFAULT_PARTNERSHIP,
            ];
        });
    }

    /**
     * Clear settings cache.
     */
    public static function clearCache(): void
    {
        Cache::forget('settings.web');
        Cache::forget('settings.ads');
        Cache::forget('settings.general');
        Cache::forget('settings.points');
    }
}
