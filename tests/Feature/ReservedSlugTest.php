<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\User;

test('reserved slugs are appended with -post suffix', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    // Create a post with a title that would generate a reserved slug
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Dashboard',
        'slug' => null, // Let HasSlug generate it
    ]);

    expect($post->slug)->toBe('dashboard-post');
});

test('reserved slugs list includes all route-conflicting paths', function () {
    $reservedSlugs = Post::getReservedSlugs();

    expect($reservedSlugs)->toContain('admin');
    expect($reservedSlugs)->toContain('dashboard');
    expect($reservedSlugs)->toContain('search');
    expect($reservedSlugs)->toContain('category');
    expect($reservedSlugs)->toContain('posts');
    expect($reservedSlugs)->toContain('settings');
    expect($reservedSlugs)->toContain('login');
    expect($reservedSlugs)->toContain('register');
});

test('isReservedSlug correctly identifies reserved slugs', function () {
    expect(Post::isReservedSlug('dashboard'))->toBeTrue();
    expect(Post::isReservedSlug('admin'))->toBeTrue();
    expect(Post::isReservedSlug('search'))->toBeTrue();
    expect(Post::isReservedSlug('DASHBOARD'))->toBeTrue(); // Case insensitive
    expect(Post::isReservedSlug('my-awesome-post'))->toBeFalse();
    expect(Post::isReservedSlug('hello-world'))->toBeFalse();
});

test('post request validation rejects titles that generate reserved slugs', function () {
    $this->seed([\Database\Seeders\RolesAndPermissionsSeeder::class]);
    $user = User::factory()->create();
    $user->assignRole('contributor');
    $category = Category::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('posts.store'), [
            'title' => 'Dashboard',
            'body' => 'This is the body content.',
            'category_id' => $category->id,
            'status' => 'draft',
        ]);

    $response->assertSessionHasErrors('title');
});

test('post request validation allows normal titles', function () {
    $this->seed([\Database\Seeders\RolesAndPermissionsSeeder::class]);
    $user = User::factory()->create();
    $user->assignRole('contributor');
    $category = Category::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('posts.store'), [
            'title' => 'My Awesome Article About Technology',
            'body' => 'This is the body content.',
            'category_id' => $category->id,
            'status' => 'draft',
        ]);

    $response->assertSessionDoesntHaveErrors('title');
    $this->assertDatabaseHas('posts', [
        'slug' => 'my-awesome-article-about-technology',
    ]);
});
