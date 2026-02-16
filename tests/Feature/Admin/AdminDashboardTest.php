<?php

use App\Models\User;

it('allows admin to access the dashboard', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/admin');

    $response->assertOk();
});

it('forbids non-admin users from accessing the dashboard', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin');

    $response->assertForbidden();
});

it('redirects guests to the login page', function () {
    $response = $this->get('/admin');

    $response->assertRedirect(route('login'));
});
