<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasSlug
{
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

    protected static function generateUniqueSlug(string $source): string
    {
        $slug = Str::slug($source);

        if (empty($slug)) {
            $slug = Str::random(8);
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
