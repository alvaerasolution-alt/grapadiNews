<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasSlug
{
    /**
     * Reserved slugs that conflict with application routes.
     * These cannot be used as post slugs since posts use /{slug} URLs.
     *
     * @var array<string>
     */
    protected static array $reservedSlugs = [
        'admin',
        'api',
        'article',
        'banners',
        'category',
        'dashboard',
        'login',
        'logout',
        'media',
        'password',
        'posts',
        'profile',
        'redemptions',
        'register',
        'search',
        'settings',
    ];

    public static function bootHasSlug(): void
    {
        static::creating(function (Model $model): void {
            if (empty($model->slug)) {
                $source = $model->getSlugSource();
                $model->slug = static::generateUniqueSlug($source);
            }
        });
    }

    protected function getSlugSource(): string
    {
        $field = property_exists($this, 'slugSource') ? $this->slugSource : 'name';

        return $this->getAttribute($field) ?? '';
    }

    /**
     * Check if a slug is reserved (conflicts with routes).
     */
    public static function isReservedSlug(string $slug): bool
    {
        return in_array(strtolower($slug), static::$reservedSlugs, true);
    }

    /**
     * Get the list of reserved slugs.
     *
     * @return array<string>
     */
    public static function getReservedSlugs(): array
    {
        return static::$reservedSlugs;
    }

    protected static function generateUniqueSlug(string $source): string
    {
        $slug = Str::slug($source);

        if (empty($slug)) {
            $slug = Str::random(8);
        }

        // If slug is reserved, append a suffix
        if (static::isReservedSlug($slug)) {
            $slug = $slug.'-post';
        }

        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
