<?php

namespace Database\Factories;

use App\Enums\PointType;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PointLog>
 */
class PointLogFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'post_id' => Post::factory(),
            'points' => 10,
            'type' => PointType::Publish,
            'reason' => 'Article published',
            'created_at' => now(),
        ];
    }

    public function forViews(int $points = 1): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => $points,
            'type' => PointType::Views,
            'reason' => "Bonus views: +{$points} points",
        ]);
    }

    public function forRedemption(int $points = 500): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => -$points,
            'type' => PointType::Redemption,
            'reason' => 'Locked for redemption',
            'post_id' => null,
        ]);
    }
}
