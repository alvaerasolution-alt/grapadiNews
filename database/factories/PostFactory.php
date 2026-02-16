<?php

namespace Database\Factories;

use App\Enums\PostStatus;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => fake()->sentence(),
            'excerpt' => fake()->paragraph(),
            'body' => fake()->paragraphs(5, true),
            'status' => PostStatus::Draft,
            'meta_title' => fake()->sentence(),
            'meta_description' => fake()->text(160),
            'view_count' => 0,
            'points_awarded_on_publish' => 0,
            'points_awarded_from_views' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PostStatus::Published,
            'published_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PostStatus::Pending,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PostStatus::Rejected,
        ]);
    }

    public function withViews(int $count = 100): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $count,
        ]);
    }
}
