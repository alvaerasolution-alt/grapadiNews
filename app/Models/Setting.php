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

            return [
                'site_name' => $settings['site_name'] ?? self::DEFAULT_SITE_NAME,
                'site_logo' => $settings['site_logo'] ?? null,
                'site_tagline' => $settings['site_tagline'] ?? self::DEFAULT_SITE_TAGLINE,
                'footer_text' => $settings['footer_text'] ?? self::DEFAULT_FOOTER_TEXT,
                'favicon' => $settings['favicon'] ?? null,
            ];
        });
    }

    /**
     * Get all ads settings as array.
     */
    public static function getAdSettings(): array
    {
        return Cache::remember('settings.ads', 3600, function () {
            $settings = static::ads()->pluck('value', 'key')->toArray();

            return [
                'mgid_site_id' => $settings['mgid_site_id'] ?? null,
                'mgid_widget_article_top' => $settings['mgid_widget_article_top'] ?? null,
                'mgid_widget_article_bottom' => $settings['mgid_widget_article_bottom'] ?? null,
                'mgid_widget_home_hero_below' => $settings['mgid_widget_home_hero_below'] ?? null,
                'mgid_widget_home_sidebar' => $settings['mgid_widget_home_sidebar'] ?? null,
                'mgid_widget_home_feed_inline' => $settings['mgid_widget_home_feed_inline'] ?? null,
                'mgid_widget_category_top' => $settings['mgid_widget_category_top'] ?? null,
                'mgid_widget_category_sidebar' => $settings['mgid_widget_category_sidebar'] ?? null,
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
    }
}
