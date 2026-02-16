<?php

namespace Database\Factories;

use App\Models\RedemptionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RedemptionItem>
 */
class RedemptionItemFactory extends Factory
{
    protected $model = RedemptionItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'image' => null,
            'point_cost' => fake()->randomElement([50, 100, 200, 500]),
            'rupiah_value' => fake()->randomElement([25000, 50000, 100000, 250000]),
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
