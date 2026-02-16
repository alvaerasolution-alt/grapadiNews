<?php

use App\Enums\PaymentMethod;
use App\Enums\PointType;
use App\Enums\RedemptionStatus;
use App\Models\RedemptionItem;
use App\Models\RedemptionRequest;
use App\Models\User;

beforeEach(function () {
    $this->seed([\Database\Seeders\RolesAndPermissionsSeeder::class]);
    $this->contributor = User::factory()->create(['points' => 500]);
    $this->contributor->assignRole('contributor');
    $this->item = RedemptionItem::factory()->create([
        'point_cost' => 100,
        'rupiah_value' => 50000,
    ]);
});

it('allows contributor to view redemption catalog', function () {
    $response = $this->actingAs($this->contributor)
        ->get('/redemptions');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('redemptions/index')
            ->has('items')
            ->where('userPoints', 500)
        );
});

it('allows contributor to view redemption form', function () {
    $response = $this->actingAs($this->contributor)
        ->get("/redemptions/{$this->item->id}/create");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('redemptions/create')
            ->where('item.id', $this->item->id)
            ->where('userPoints', 500)
            ->has('paymentMethods')
        );
});

it('allows contributor to submit bank transfer redemption', function () {
    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::BankTransfer->value,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Test User',
        ]);

    $response->assertRedirect('/redemptions/history');
    $response->assertSessionHas('success');

    expect($this->contributor->fresh()->points)->toBe(400);
    $this->assertDatabaseHas('redemption_requests', [
        'user_id' => $this->contributor->id,
        'redemption_item_id' => $this->item->id,
        'point_cost' => 100,
        'rupiah_value' => 50000,
        'payment_method' => PaymentMethod::BankTransfer->value,
        'bank_name' => 'BCA',
        'status' => RedemptionStatus::Pending->value,
    ]);
    $this->assertDatabaseHas('point_logs', [
        'user_id' => $this->contributor->id,
        'points' => -100,
        'type' => PointType::Redemption->value,
    ]);
});

it('allows contributor to submit e-wallet redemption', function () {
    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::EWallet->value,
            'ewallet_provider' => 'GoPay',
            'ewallet_number' => '081234567890',
            'ewallet_name' => 'Test User',
        ]);

    $response->assertRedirect('/redemptions/history');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('redemption_requests', [
        'user_id' => $this->contributor->id,
        'payment_method' => PaymentMethod::EWallet->value,
        'ewallet_provider' => 'GoPay',
        'ewallet_number' => '081234567890',
        'ewallet_name' => 'Test User',
        'bank_name' => null,
        'account_number' => null,
        'account_holder' => null,
    ]);
});

it('prevents redemption without sufficient points', function () {
    $this->contributor->update(['points' => 50]);

    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::BankTransfer->value,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Test User',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', fn ($message) => str_contains($message, 'Poin tidak cukup'));
    expect($this->contributor->fresh()->points)->toBe(50);
});

it('prevents exceeding max pending requests', function () {
    // Create existing pending request
    RedemptionRequest::factory()->create([
        'user_id' => $this->contributor->id,
        'status' => RedemptionStatus::Pending,
    ]);

    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::BankTransfer->value,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Test User',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', fn ($message) => str_contains($message, 'permintaan yang belum diproses'));
});

it('enforces cooldown between requests', function () {
    // Create a completed request from 1 hour ago (completed so it doesn't trigger max pending check)
    RedemptionRequest::factory()->completed()->create([
        'user_id' => $this->contributor->id,
        'created_at' => now()->subHour(),
    ]);

    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::BankTransfer->value,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Test User',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', fn ($message) => str_contains($message, 'menunggu'));
});

it('allows contributor to view redemption history', function () {
    RedemptionRequest::factory()->count(3)->create([
        'user_id' => $this->contributor->id,
    ]);

    $response = $this->actingAs($this->contributor)
        ->get('/redemptions/history');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('redemptions/history')
            ->has('requests.data', 3)
            ->where('userPoints', 500)
        );
});

it('validates bank transfer fields when payment method is bank_transfer', function () {
    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::BankTransfer->value,
        ]);

    $response->assertSessionHasErrors(['bank_name', 'account_number', 'account_holder']);
});

it('validates e-wallet fields when payment method is e_wallet', function () {
    $response = $this->actingAs($this->contributor)
        ->post("/redemptions/{$this->item->id}", [
            'payment_method' => PaymentMethod::EWallet->value,
        ]);

    $response->assertSessionHasErrors(['ewallet_provider', 'ewallet_number', 'ewallet_name']);
});
