<?php

use App\Models\Setting;
use App\Models\User;

it('allows admin to view web settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'site_name', 'value' => 'GrapadiNews', 'group' => 'web']);

    $response = $this->actingAs($admin)->get('/admin/settings/web');

    $response->assertOk();
});

it('allows admin to update web settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'site_name', 'value' => 'OldName', 'group' => 'web']);

    $response = $this->actingAs($admin)->post('/admin/settings/web', [
        'site_name' => 'NewName',
        'site_tagline' => 'Test tagline',
        'footer_text' => 'Test footer',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('settings', ['key' => 'site_name', 'value' => 'NewName']);
});

it('allows admin to view ads settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'mgid_site_id', 'value' => 'test-site.com', 'group' => 'ads']);

    $response = $this->actingAs($admin)->get('/admin/settings/ads');

    $response->assertOk();
});

it('allows admin to update ads settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'mgid_site_id', 'value' => 'old-site.com', 'group' => 'ads']);

    $response = $this->actingAs($admin)->post('/admin/settings/ads', [
        'mgid_site_id' => 'new-site.com',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('settings', ['key' => 'mgid_site_id', 'value' => 'new-site.com']);
});

it('forbids non-admin users from accessing web settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/settings/web');

    $response->assertForbidden();
});
