<?php

use App\Enums\PointType;
use App\Enums\PostStatus;
use App\Models\Post;
use App\Models\User;

test('publishing a post awards 10 points to the author', function () {
    $user = User::factory()->create(['points' => 0]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Draft,
        'points_awarded_on_publish' => 0,
    ]);

    // Update status to Published
    $post->update(['status' => PostStatus::Published]);

    // Verify points
    expect($user->fresh()->points)->toBe(10);

    // Verify log
    $this->assertDatabaseHas('point_logs', [
        'user_id' => $user->id,
        'points' => 10,
        'type' => PointType::Publish->value,
        'post_id' => $post->id,
    ]);

    // Verify post updated
    expect($post->fresh()->points_awarded_on_publish)->toBe(10);
});

test('publishing a post again does not award points twice', function () {
    $user = User::factory()->create(['points' => 10]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Published,
        'points_awarded_on_publish' => 10,
    ]);

    // Update something else (e.g. title)
    $post->update(['title' => 'New Title']);

    // Verify points unchanged
    expect($user->fresh()->points)->toBe(10);
});

test('draft posts do not award points', function () {
    $user = User::factory()->create(['points' => 0]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Draft,
        'points_awarded_on_publish' => 0,
    ]);

    // Update title
    $post->update(['title' => 'Updated Draft']);

    // Verify points
    expect($user->fresh()->points)->toBe(0);
});
