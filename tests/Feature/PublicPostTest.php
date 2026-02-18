<?php

use App\Models\Category;
use App\Models\Post;

it('loads the homepage successfully', function () {
    Post::factory()->published()->count(3)->create();

    $response = $this->get('/');

    $response->assertOk();
});

it('loads the article detail page for a published post', function () {
    $post = Post::factory()->published()->create();

    $response = $this->get("/{$post->slug}");

    $response->assertOk();
});

it('returns 404 for a draft post', function () {
    $post = Post::factory()->create();

    $response = $this->get("/{$post->slug}");

    $response->assertNotFound();
});

it('increments the view count on article detail', function () {
    $post = Post::factory()->published()->create(['view_count' => 0]);

    $this->get("/{$post->slug}");

    expect($post->fresh()->view_count)->toBe(1);
});

it('redirects legacy article URL to new format', function () {
    $post = Post::factory()->published()->create();

    $response = $this->get("/article/{$post->slug}");

    $response->assertRedirect("/{$post->slug}");
});

it('loads the category page successfully', function () {
    $category = Category::factory()->create();
    Post::factory()->published()->create(['category_id' => $category->id]);

    $response = $this->get("/category/{$category->slug}");

    $response->assertOk();
});

it('shows only published posts on the category page', function () {
    $category = Category::factory()->create();
    Post::factory()->published()->create(['category_id' => $category->id, 'title' => 'Published Article']);
    Post::factory()->create(['category_id' => $category->id, 'title' => 'Draft Article']);

    $response = $this->get("/category/{$category->slug}");

    $response->assertOk();
    $response->assertSee('Published Article');
    $response->assertDontSee('Draft Article');
});
