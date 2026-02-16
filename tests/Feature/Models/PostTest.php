<?php

use App\Enums\PostStatus;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('auto-generates a slug from title on creation', function () {
    $post = Post::factory()->create(['title' => 'Cara Install Laravel 12']);

    expect($post->slug)->toBe('cara-install-laravel-12');
});

it('generates unique slugs for duplicate titles', function () {
    $post1 = Post::factory()->create(['title' => 'Tutorial React']);
    $post2 = Post::factory()->create(['title' => 'Tutorial React']);

    expect($post1->slug)->toBe('tutorial-react');
    expect($post2->slug)->toBe('tutorial-react-1');
});

it('does not override a manually set slug', function () {
    $post = Post::factory()->create([
        'title' => 'Some Title',
        'slug' => 'custom-slug',
    ]);

    expect($post->slug)->toBe('custom-slug');
});

it('belongs to a user', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    expect($post->user->id)->toBe($user->id);
});

it('belongs to a category', function () {
    $category = Category::factory()->create();
    $post = Post::factory()->create(['category_id' => $category->id]);

    expect($post->category->id)->toBe($category->id);
});

it('can have many tags', function () {
    $post = Post::factory()->create();
    $tags = Tag::factory()->count(3)->create();
    $post->tags()->attach($tags);

    expect($post->tags)->toHaveCount(3);
});

it('casts status to PostStatus enum', function () {
    $post = Post::factory()->published()->create();

    expect($post->status)->toBe(PostStatus::Published);
});

it('scopes to published posts', function () {
    Post::factory()->published()->count(2)->create();
    Post::factory()->create(); // draft
    Post::factory()->pending()->create();

    expect(Post::published()->count())->toBe(2);
});

it('scopes to pending posts', function () {
    Post::factory()->pending()->count(3)->create();
    Post::factory()->published()->create();

    expect(Post::pending()->count())->toBe(3);
});

it('scopes to draft posts', function () {
    Post::factory()->count(2)->create(); // draft by default
    Post::factory()->published()->create();

    expect(Post::draft()->count())->toBe(2);
});

it('uses slug as route key', function () {
    $post = Post::factory()->create(['title' => 'My Great Post']);

    expect($post->getRouteKeyName())->toBe('slug');
});
