<?php

use App\Models\Setting;
use App\Models\User;

it('allows admin to view point settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'publish_points_enabled', 'value' => '1', 'group' => 'points']);
    Setting::create(['key' => 'points_per_publish', 'value' => '10', 'group' => 'points']);

    $response = $this->actingAs($admin)->get('/admin/settings/points');

    $response->assertOk();
});

it('allows admin to update point settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'publish_points_enabled', 'value' => '1', 'group' => 'points']);
    Setting::create(['key' => 'points_per_publish', 'value' => '10', 'group' => 'points']);
    Setting::create(['key' => 'view_points_enabled', 'value' => '1', 'group' => 'points']);
    Setting::create(['key' => 'views_per_point', 'value' => '5000', 'group' => 'points']);
    Setting::create(['key' => 'max_points_per_article', 'value' => '10', 'group' => 'points']);
    Setting::create(['key' => 'rupiah_per_point', 'value' => '10000', 'group' => 'points']);
    Setting::create(['key' => 'max_pending_requests', 'value' => '3', 'group' => 'points']);
    Setting::create(['key' => 'redemption_cooldown_hours', 'value' => '24', 'group' => 'points']);

    $response = $this->actingAs($admin)->post('/admin/settings/points', [
        'publish_points_enabled' => true,
        'points_per_publish' => 25,
        'view_points_enabled' => false,
        'views_per_point' => 1000,
        'max_points_per_article' => 20,
        'rupiah_per_point' => 15000,
        'max_pending_requests' => 5,
        'redemption_cooldown_hours' => 48,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('settings', ['key' => 'points_per_publish', 'value' => '25']);
    $this->assertDatabaseHas('settings', ['key' => 'views_per_point', 'value' => '1000']);
    $this->assertDatabaseHas('settings', ['key' => 'rupiah_per_point', 'value' => '15000']);
    $this->assertDatabaseHas('settings', ['key' => 'view_points_enabled', 'value' => '0']);
});

it('validates point settings input', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/admin/settings/points', []);

    $response->assertSessionHasErrors([
        'publish_points_enabled',
        'points_per_publish',
        'view_points_enabled',
        'views_per_point',
        'max_points_per_article',
        'rupiah_per_point',
        'max_pending_requests',
        'redemption_cooldown_hours',
    ]);
});

it('forbids non-admin users from accessing point settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/settings/points');

    $response->assertForbidden();
});
