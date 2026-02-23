<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;

it('allows authenticated user to post a comment', function () {
    $user = User::factory()->create();
    $post = Post::factory()->published()->create();

    $response = $this->actingAs($user)->post("/posts/{$post->slug}/comments", [
        'body' => 'Artikel yang sangat bagus!',
    ]);

    $response->assertRedirect();
    $comment = Comment::where('post_id', $post->id)->first();
    expect($comment)->not->toBeNull();
    expect($comment->user_id)->toBe($user->id);
    expect($comment->guest_name)->toBeNull();
});

it('allows guest to post a comment with name and email', function () {
    $post = Post::factory()->published()->create();

    $response = $this->post("/posts/{$post->slug}/comments", [
        'body' => 'Komentar dari tamu!',
        'guest_name' => 'Budi',
        'guest_email' => 'budi@example.com',
    ]);

    $response->assertRedirect();
    $comment = Comment::where('post_id', $post->id)->first();
    expect($comment)->not->toBeNull();
    expect($comment->user_id)->toBeNull();
    expect($comment->guest_name)->toBe('Budi');
    expect($comment->guest_email)->toBe('budi@example.com');
});

it('requires name and email for guest comments', function () {
    $post = Post::factory()->published()->create();

    $response = $this->post("/posts/{$post->slug}/comments", [
        'body' => 'Test comment tanpa nama',
    ]);

    $response->assertSessionHasErrors(['guest_name', 'guest_email']);
});

it('does not require name and email for authenticated comments', function () {
    $user = User::factory()->create();
    $post = Post::factory()->published()->create();

    $response = $this->actingAs($user)->post("/posts/{$post->slug}/comments", [
        'body' => 'Komentar user login',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    expect(Comment::where('post_id', $post->id)->count())->toBe(1);
});

it('validates comment body is required', function () {
    $post = Post::factory()->published()->create();

    $response = $this->post("/posts/{$post->slug}/comments", [
        'body' => '',
        'guest_name' => 'Tamu',
        'guest_email' => 'tamu@example.com',
    ]);

    $response->assertSessionHasErrors('body');
});

it('validates comment body max length', function () {
    $post = Post::factory()->published()->create();

    $response = $this->post("/posts/{$post->slug}/comments", [
        'body' => str_repeat('a', 1001),
        'guest_name' => 'Tamu',
        'guest_email' => 'tamu@example.com',
    ]);

    $response->assertSessionHasErrors('body');
});

it('allows comment owner to delete their comment', function () {
    $user = User::factory()->create();
    $post = Post::factory()->published()->create();
    $comment = Comment::factory()->create(['user_id' => $user->id, 'post_id' => $post->id]);

    $response = $this->actingAs($user)->delete("/comments/{$comment->id}");

    $response->assertRedirect();
    expect(Comment::find($comment->id))->toBeNull();
});

it('allows admin to delete any comment', function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $comment = Comment::factory()->create();

    $response = $this->actingAs($admin)->delete("/comments/{$comment->id}");

    $response->assertRedirect();
    expect(Comment::find($comment->id))->toBeNull();
});

it('prevents user from deleting another users comment', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $comment = Comment::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->delete("/comments/{$comment->id}");

    $response->assertForbidden();
    expect(Comment::find($comment->id))->not->toBeNull();
});

it('loads comments on post show page', function () {
    $post = Post::factory()->published()->create();
    Comment::factory()->count(3)->create(['post_id' => $post->id]);

    $response = $this->get("/{$post->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/post-show')
        ->where('post.comments_count', 3)
        ->has('comments', 3)
    );
});

it('shows commenter_name for guest comments', function () {
    $post = Post::factory()->published()->create();
    Comment::create([
        'post_id' => $post->id,
        'body' => 'Halo dari tamu',
        'guest_name' => 'Tamu Test',
        'guest_email' => 'tamu@test.com',
    ]);

    $response = $this->get("/{$post->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/post-show')
        ->has('comments', 1)
        ->where('comments.0.commenter_name', 'Tamu Test')
        ->where('comments.0.user', null)
    );
});
