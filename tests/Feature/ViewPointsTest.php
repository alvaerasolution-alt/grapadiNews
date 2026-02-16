<?php

use App\Enums\PointType;
use App\Enums\PostStatus;
use App\Models\Post;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;

test('calculates view points correctly', function () {
    // 100 views per point, max 10 points
    Setting::set('views_per_point', 100);
    Setting::set('max_points_per_article', 10);

    $user = User::factory()->create(['points' => 0]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Published,
        'view_count' => 250, // Should be 2 points (floor(250/100))
        'points_awarded_from_views' => 0,
    ]);

    Artisan::call('points:calculate-views');

    expect($user->fresh()->points)->toBe(2);
    expect($post->fresh()->points_awarded_from_views)->toBe(2);

    $this->assertDatabaseHas('point_logs', [
        'user_id' => $user->id,
        'points' => 2,
        'type' => PointType::Views->value,
        'post_id' => $post->id,
    ]);
});

test('respects max points cap per article', function () {
    Setting::set('views_per_point', 100);
    Setting::set('max_points_per_article', 5); // Cap at 5

    $user = User::factory()->create(['points' => 0]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Published,
        'view_count' => 1000, // Should be 10 points, but cap is 5
        'points_awarded_from_views' => 0,
    ]);

    Artisan::call('points:calculate-views');

    expect($user->fresh()->points)->toBe(5);
    expect($post->fresh()->points_awarded_from_views)->toBe(5);
});

test('awards incremental points for new views', function () {
    Setting::set('views_per_point', 100);
    Setting::set('max_points_per_article', 10);

    $user = User::factory()->create(['points' => 5]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Published,
        'view_count' => 500, // 5 points
        'points_awarded_from_views' => 5, // Already awarded
    ]);

    // Views increase to 850 (total 8 points)
    $post->update(['view_count' => 850]);

    Artisan::call('points:calculate-views');

    // Should award 3 more points (8 - 5)
    expect($user->fresh()->points)->toBe(8); // 5 + 3
    expect($post->fresh()->points_awarded_from_views)->toBe(8);

    // Verify log for the increment
    $this->assertDatabaseHas('point_logs', [
        'user_id' => $user->id,
        'points' => 3,
        'type' => PointType::Views->value,
        'post_id' => $post->id,
    ]);
});

test('does not process unpublished posts', function () {
    Setting::set('views_per_point', 100);

    $user = User::factory()->create(['points' => 0]);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'status' => PostStatus::Draft,
        'view_count' => 500,
        'points_awarded_from_views' => 0,
    ]);

    Artisan::call('points:calculate-views');

    expect($user->fresh()->points)->toBe(0);
});
