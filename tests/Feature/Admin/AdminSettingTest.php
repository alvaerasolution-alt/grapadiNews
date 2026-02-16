<?php

use App\Models\Setting;
use App\Models\User;

it('allows admin to view settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'site_name', 'value' => 'GrapadiNews']);

    $response = $this->actingAs($admin)->get('/admin/settings');

    $response->assertOk();
});

it('allows admin to update settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::create(['key' => 'site_name', 'value' => 'OldName']);

    $response = $this->actingAs($admin)->put('/admin/settings', [
        'settings' => [
            ['key' => 'site_name', 'value' => 'NewName'],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('settings', ['key' => 'site_name', 'value' => 'NewName']);
});

it('forbids non-admin users from accessing settings', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/settings');

    $response->assertForbidden();
});
