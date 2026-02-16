<?php

use App\Models\Post;
use App\Models\User;

it('allows admin to view all posts', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Post::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/posts');

    $response->assertOk();
});

it('allows admin to view a single post', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $post = Post::factory()->create();

    $response = $this->actingAs($admin)->get("/admin/posts/{$post->slug}");

    $response->assertOk();
});

it('allows admin to update post status to published', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $post = Post::factory()->create();

    $response = $this->actingAs($admin)->patch("/admin/posts/{$post->slug}/status", [
        'status' => 'published',
    ]);

    $response->assertRedirect();
    expect($post->fresh()->status->value)->toBe('published');
    expect($post->fresh()->published_at)->not->toBeNull();
});

it('allows admin to delete a post', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $post = Post::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/posts/{$post->slug}");

    $response->assertRedirect(route('admin.posts.index'));
    $this->assertDatabaseMissing('posts', ['id' => $post->id]);
});

it('forbids non-admin users from accessing admin posts', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('contributor');

    $response = $this->actingAs($user)->get('/admin/posts');

    $response->assertForbidden();
});
