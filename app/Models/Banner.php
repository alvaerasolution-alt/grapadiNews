<?php

namespace App\Models;

use App\Enums\BannerPosition;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'url',
        'position',
        'is_active',
        'sort_order',
        'starts_at',
        'ends_at',
        'click_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => BannerPosition::class,
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'click_count' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * Scope: only active banners within their scheduled date range.
     *
     * @param  Builder<Banner>  $query
     * @return Builder<Banner>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function (Builder $q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function (Builder $q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    /**
     * @param  Builder<Banner>  $query
     * @return Builder<Banner>
     */
    public function scopePosition(Builder $query, BannerPosition $position): Builder
    {
        return $query->where('position', $position);
    }

    /**
     * @param  Builder<Banner>  $query
     * @return Builder<Banner>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Helper to fetch active banners for a given position.
     *
     * @return \Illuminate\Support\Collection<int, array{id: int, title: string, image: string, url: string}>
     */
    public static function forSlot(BannerPosition $position): \Illuminate\Support\Collection
    {
        return static::active()
            ->position($position)
            ->ordered()
            ->get()
            ->map(fn (self $banner) => [
                'id' => $banner->id,
                'title' => $banner->title,
                'image' => $banner->image,
                'url' => $banner->url,
            ]);
    }
}
