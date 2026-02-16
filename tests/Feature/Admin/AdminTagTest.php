<?php

use App\Models\Tag;
use App\Models\User;

it('allows admin to view tags', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Tag::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/tags');

    $response->assertOk();
});

it('allows admin to create a tag', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/admin/tags', [
        'name' => 'Laravel',
    ]);

    $response->assertRedirect(route('admin.tags.index'));
    $this->assertDatabaseHas('tags', ['name' => 'Laravel']);
});

it('allows admin to update a tag', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $tag = Tag::factory()->create(['name' => 'Old Tag']);

    $response = $this->actingAs($admin)->put("/admin/tags/{$tag->id}", [
        'name' => 'New Tag',
    ]);

    $response->assertRedirect(route('admin.tags.index'));
    expect($tag->fresh()->name)->toBe('New Tag');
});

it('allows admin to delete a tag without posts', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $tag = Tag::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/tags/{$tag->id}");

    $response->assertRedirect(route('admin.tags.index'));
    $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
});

it('forbids non-admin users from accessing tags', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/tags');

    $response->assertForbidden();
});
