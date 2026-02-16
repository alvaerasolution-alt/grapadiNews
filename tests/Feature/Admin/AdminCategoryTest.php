<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\User;

it('allows admin to view categories', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Category::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/categories');

    $response->assertOk();
});

it('allows admin to create a category', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/admin/categories', [
        'name' => 'Technology',
        'description' => 'Tech related news',
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseHas('categories', ['name' => 'Technology']);
});

it('allows admin to update a category', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $category = Category::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($admin)->put("/admin/categories/{$category->slug}", [
        'name' => 'New Name',
        'description' => 'Updated description',
    ]);

    $response->assertRedirect(route('admin.categories.index'));
    expect($category->fresh()->name)->toBe('New Name');
});

it('allows admin to delete a category without posts', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/categories/{$category->slug}");

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

it('prevents admin from deleting a category with posts', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $category = Category::factory()->create();
    Post::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs($admin)->delete("/admin/categories/{$category->slug}");

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Cannot delete category with existing posts.');
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

it('forbids non-admin users from accessing categories', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/categories');

    $response->assertForbidden();
});
