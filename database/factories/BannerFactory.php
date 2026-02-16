<?php

namespace Database\Factories;

use App\Enums\BannerPosition;
use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'image' => 'banners/sample-banner.jpg',
            'url' => fake()->url(),
            'position' => BannerPosition::ArticleTop,
            'is_active' => true,
            'sort_order' => 0,
            'starts_at' => null,
            'ends_at' => null,
            'click_count' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function articleTop(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::ArticleTop,
        ]);
    }

    public function articleBottom(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::ArticleBottom,
        ]);
    }

    public function homeHeroBelow(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::HomeHeroBelow,
        ]);
    }

    public function homeSidebar(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::HomeSidebar,
        ]);
    }

    public function homeFeedInline(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::HomeFeedInline,
        ]);
    }

    public function categoryTop(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::CategoryTop,
        ]);
    }

    public function categorySidebar(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::CategorySidebar,
        ]);
    }

    public function globalPopup(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => BannerPosition::GlobalPopup,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'ends_at' => now()->subDay(),
        ]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addWeek(),
        ]);
    }

    public function futureScheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addWeek(),
        ]);
    }
}
