<?php

use App\Models\Post;

it('returns search results for matching query', function () {
    Post::factory()->published()->create(['title' => 'Laravel Best Practices']);
    Post::factory()->published()->create(['title' => 'React Components Guide']);

    $response = $this->getJson('/search?q=Laravel');

    $response->assertOk();
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['title' => 'Laravel Best Practices']);
});

it('returns empty results for non-matching query', function () {
    Post::factory()->published()->create(['title' => 'Laravel Best Practices']);

    $response = $this->getJson('/search?q=Python');

    $response->assertOk();
    $response->assertJsonCount(0);
});

it('only returns published posts in search', function () {
    Post::factory()->published()->create(['title' => 'Published Laravel Article']);
    Post::factory()->create(['title' => 'Draft Laravel Article']);

    $response = $this->getJson('/search?q=Laravel');

    $response->assertOk();
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['title' => 'Published Laravel Article']);
});

it('returns empty array when query is too short', function () {
    Post::factory()->published()->create(['title' => 'Test Article']);

    $response = $this->getJson('/search?q=T');

    $response->assertOk();
    $response->assertJsonCount(0);
});

it('searches in excerpts too', function () {
    Post::factory()->published()->create([
        'title' => 'Some Title',
        'excerpt' => 'This article covers Laravel tips',
    ]);

    $response = $this->getJson('/search?q=Laravel');

    $response->assertOk();
    $response->assertJsonCount(1);
});

it('limits results to 8', function () {
    Post::factory()->published()->count(12)->create(['title' => 'Laravel Article']);

    $response = $this->getJson('/search?q=Laravel');

    $response->assertOk();
    $response->assertJsonCount(8);
});
