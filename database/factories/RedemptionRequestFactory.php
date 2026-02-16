<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\RedemptionStatus;
use App\Models\RedemptionItem;
use App\Models\RedemptionRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RedemptionRequest>
 */
class RedemptionRequestFactory extends Factory
{
    protected $model = RedemptionRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'redemption_item_id' => RedemptionItem::factory(),
            'point_cost' => 100,
            'rupiah_value' => 50000,
            'payment_method' => PaymentMethod::BankTransfer,
            'bank_name' => 'BCA',
            'account_number' => fake()->numerify('##########'),
            'account_holder' => fake()->name(),
            'status' => RedemptionStatus::Pending,
        ];
    }

    public function bankTransfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => PaymentMethod::BankTransfer,
            'bank_name' => 'BCA',
            'account_number' => fake()->numerify('##########'),
            'account_holder' => fake()->name(),
            'ewallet_provider' => null,
            'ewallet_number' => null,
            'ewallet_name' => null,
        ]);
    }

    public function eWallet(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => PaymentMethod::EWallet,
            'ewallet_provider' => 'GoPay',
            'ewallet_number' => fake()->numerify('08##########'),
            'ewallet_name' => fake()->name(),
            'bank_name' => null,
            'account_number' => null,
            'account_holder' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RedemptionStatus::Pending,
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RedemptionStatus::Processing,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RedemptionStatus::Completed,
            'processed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RedemptionStatus::Rejected,
            'admin_note' => 'Data tidak valid.',
            'processed_at' => now(),
        ]);
    }
}
