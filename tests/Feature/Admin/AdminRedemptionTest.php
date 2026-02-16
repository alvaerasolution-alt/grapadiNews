<?php

use App\Enums\PointType;
use App\Enums\RedemptionStatus;
use App\Models\RedemptionItem;
use App\Models\RedemptionRequest;
use App\Models\User;

beforeEach(function () {
    $this->seed([\Database\Seeders\RolesAndPermissionsSeeder::class]);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
    $this->item = RedemptionItem::factory()->create();
});

it('allows admin to view redemption items list', function () {
    RedemptionItem::factory()->count(5)->create();

    $response = $this->actingAs($this->admin)
        ->get('/admin/redemption-items');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/redemption-items/index')
            ->has('items.data', 6) // 5 + 1 from beforeEach
        );
});

it('allows admin to create redemption item', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/redemption-items', [
            'name' => 'Pulsa Rp100.000',
            'description' => 'Pulsa untuk semua operator',
            'point_cost' => 200,
            'rupiah_value' => 100000,
            'is_active' => true,
            'sort_order' => 1,
        ]);

    $response->assertRedirect('/admin/redemption-items');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('redemption_items', [
        'name' => 'Pulsa Rp100.000',
        'point_cost' => 200,
        'rupiah_value' => 100000,
        'is_active' => true,
    ]);
});

it('allows admin to edit redemption item', function () {
    $response = $this->actingAs($this->admin)
        ->put("/admin/redemption-items/{$this->item->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'point_cost' => 300,
            'rupiah_value' => 150000,
            'is_active' => false,
            'sort_order' => 5,
        ]);

    $response->assertRedirect('/admin/redemption-items');
    $response->assertSessionHas('success');

    $this->item->refresh();
    expect($this->item->name)->toBe('Updated Name');
    expect($this->item->point_cost)->toBe(300);
    expect($this->item->is_active)->toBeFalse();
});

it('prevents deleting redemption item with existing requests', function () {
    $contributor = User::factory()->create();
    $contributor->assignRole('contributor');

    RedemptionRequest::factory()->create([
        'user_id' => $contributor->id,
        'redemption_item_id' => $this->item->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete("/admin/redemption-items/{$this->item->id}");

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('redemption_items', ['id' => $this->item->id]);
});

it('allows admin to view redemption requests list', function () {
    $contributor = User::factory()->create();
    $contributor->assignRole('contributor');

    RedemptionRequest::factory()->count(5)->create([
        'user_id' => $contributor->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/redemption-requests');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/redemption-requests/index')
            ->has('requests.data', 5)
            ->has('statuses')
        );
});

it('allows admin to filter redemption requests by status', function () {
    $contributor = User::factory()->create();
    $contributor->assignRole('contributor');

    RedemptionRequest::factory()->completed()->create(['user_id' => $contributor->id]);
    RedemptionRequest::factory()->pending()->create(['user_id' => $contributor->id]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/redemption-requests?status='.RedemptionStatus::Completed->value);

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('currentStatus', RedemptionStatus::Completed->value)
            ->has('requests.data', 1)
        );
});

it('allows admin to view redemption request detail', function () {
    $contributor = User::factory()->create(['points' => 400]);
    $contributor->assignRole('contributor');

    $request = RedemptionRequest::factory()->create([
        'user_id' => $contributor->id,
        'point_cost' => 100,
    ]);

    $response = $this->actingAs($this->admin)
        ->get("/admin/redemption-requests/{$request->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/redemption-requests/show')
            ->where('redemptionRequest.id', $request->id)
            ->has('availableStatuses')
        );
});

it('allows admin to approve redemption request', function () {
    $contributor = User::factory()->create(['points' => 400]);
    $contributor->assignRole('contributor');

    $request = RedemptionRequest::factory()->create([
        'user_id' => $contributor->id,
        'point_cost' => 100,
        'status' => RedemptionStatus::Pending,
    ]);

    $response = $this->actingAs($this->admin)
        ->patch("/admin/redemption-requests/{$request->id}/status", [
            'status' => RedemptionStatus::Completed->value,
            'admin_note' => 'Transfer berhasil',
        ]);

    $response->assertRedirect('/admin/redemption-requests');
    $response->assertSessionHas('success');

    $request->refresh();
    expect($request->status)->toBe(RedemptionStatus::Completed);
    expect($request->admin_note)->toBe('Transfer berhasil');
    expect($request->processed_by)->toBe($this->admin->id);
    expect($request->processed_at)->not->toBeNull();
});

it('refunds points when admin rejects redemption request', function () {
    $contributor = User::factory()->create(['points' => 400]);
    $contributor->assignRole('contributor');

    $request = RedemptionRequest::factory()->create([
        'user_id' => $contributor->id,
        'point_cost' => 100,
        'status' => RedemptionStatus::Pending,
    ]);

    $response = $this->actingAs($this->admin)
        ->patch("/admin/redemption-requests/{$request->id}/status", [
            'status' => RedemptionStatus::Rejected->value,
            'admin_note' => 'Data tidak valid',
        ]);

    $response->assertRedirect('/admin/redemption-requests');

    // Points refunded
    expect($contributor->fresh()->points)->toBe(500);

    $this->assertDatabaseHas('point_logs', [
        'user_id' => $contributor->id,
        'points' => 100,
        'type' => PointType::Refund->value,
    ]);
});

it('requires authentication for redemption routes', function () {
    $response = $this->get('/redemptions');
    $response->assertRedirect('/login');
});

it('requires admin role for admin redemption routes', function () {
    $contributor = User::factory()->create();
    $contributor->assignRole('contributor');

    $response = $this->actingAs($contributor)
        ->get('/admin/redemption-items');

    $response->assertForbidden();
});
