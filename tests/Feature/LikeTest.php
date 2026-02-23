<?php

use App\Models\Like;
use App\Models\Post;

it('allows guest to like a published post via session', function () {
    $post = Post::factory()->published()->create();

    $response = $this->post("/posts/{$post->slug}/like");

    $response->assertRedirect();
    expect(Like::where('post_id', $post->id)->count())->toBe(1);
});

it('allows guest to unlike a post via session', function () {
    $post = Post::factory()->published()->create();

    // Like first
    $this->withSession(['liked_posts' => [$post->id]])
        ->post("/posts/{$post->slug}/like");

    expect(Like::where('post_id', $post->id)->count())->toBe(0);
});

it('shows likes count on post show page', function () {
    $post = Post::factory()->published()->create();

    Like::factory()->count(3)->create(['post_id' => $post->id]);

    $response = $this->get("/{$post->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/post-show')
        ->where('post.likes_count', 3)
    );
});

it('shows is_liked as true after liking', function () {
    $post = Post::factory()->published()->create();

    $this->post("/posts/{$post->slug}/like");

    $response = $this->get("/{$post->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/post-show')
        ->where('post.is_liked', true)
    );
});

it('shows is_liked as false when not liked', function () {
    $post = Post::factory()->published()->create();

    $response = $this->get("/{$post->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/post-show')
        ->where('post.is_liked', false)
    );
});
