<?php

use App\Models\User;

it('allows admin to view users list', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/users');

    $response->assertOk();
});

it('allows admin to view user detail', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    $this->withoutVite();

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();

    $response = $this->actingAs($admin)->get("/admin/users/{$user->id}");

    $response->assertOk();
});

it('allows admin to update user role', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}/role", [
        'role' => 'admin',
    ]);

    $response->assertRedirect();
    expect($user->fresh()->hasRole('admin'))->toBeTrue();
});

it('forbids non-admin users from accessing user management', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/users');

    $response->assertForbidden();
});
