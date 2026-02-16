<?php

use App\Models\Banner;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([\Database\Seeders\RolesAndPermissionsSeeder::class]);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->contributor = User::factory()->create();
    $this->contributor->assignRole('contributor');
});

// ─── Admin CRUD ────────────────────

it('allows admin to view banner list', function () {
    Banner::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)
        ->get('/admin/banners');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/banners/index')
            ->has('banners.data', 3)
        );
});

it('allows admin to create a banner', function () {
    Storage::fake('public');

    $response = $this->actingAs($this->admin)
        ->post('/admin/banners', [
            'title' => 'Test Banner',
            'image' => UploadedFile::fake()->image('banner.jpg', 800, 200),
            'url' => 'https://example.com',
            'position' => 'article_top',
            'is_active' => true,
            'sort_order' => 0,
        ]);

    $response->assertRedirect('/admin/banners');

    $this->assertDatabaseHas('banners', [
        'title' => 'Test Banner',
        'url' => 'https://example.com',
        'position' => 'article_top',
    ]);
});

it('allows admin to create a banner with scheduling', function () {
    Storage::fake('public');

    $response = $this->actingAs($this->admin)
        ->post('/admin/banners', [
            'title' => 'Scheduled Banner',
            'image' => UploadedFile::fake()->image('banner.jpg', 800, 200),
            'url' => 'https://example.com',
            'position' => 'home_hero_below',
            'is_active' => true,
            'sort_order' => 0,
            'starts_at' => '2026-01-01 00:00:00',
            'ends_at' => '2026-12-31 23:59:59',
        ]);

    $response->assertRedirect('/admin/banners');

    $this->assertDatabaseHas('banners', [
        'title' => 'Scheduled Banner',
        'position' => 'home_hero_below',
    ]);
});

it('allows admin to update a banner', function () {
    Storage::fake('public');

    $banner = Banner::factory()->create();

    $response = $this->actingAs($this->admin)
        ->put("/admin/banners/{$banner->id}", [
            'title' => 'Updated Banner',
            'url' => 'https://updated.com',
            'position' => 'article_bottom',
            'is_active' => false,
            'sort_order' => 5,
        ]);

    $response->assertRedirect('/admin/banners');

    $banner->refresh();
    expect($banner->title)->toBe('Updated Banner');
    expect($banner->url)->toBe('https://updated.com');
    expect($banner->position->value)->toBe('article_bottom');
    expect($banner->is_active)->toBeFalse();
});

it('allows admin to delete a banner', function () {
    $banner = Banner::factory()->create();

    $response = $this->actingAs($this->admin)
        ->delete("/admin/banners/{$banner->id}");

    $response->assertRedirect('/admin/banners');
    $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
});

it('prevents non-admin from accessing banner management', function () {
    $response = $this->actingAs($this->contributor)
        ->get('/admin/banners');

    $response->assertForbidden();
});

it('validates required fields on banner creation', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/banners', []);

    $response->assertSessionHasErrors(['title', 'image', 'url', 'position']);
});

// ─── Click Tracking ────────────────

it('tracks banner click and increments counter', function () {
    $banner = Banner::factory()->create(['click_count' => 0]);

    $response = $this->post("/banners/{$banner->id}/click");

    $response->assertOk()
        ->assertJson(['redirect' => $banner->url]);

    $banner->refresh();
    expect($banner->click_count)->toBe(1);
});

// ─── Scheduling ────────────────────

it('excludes expired banners from active scope', function () {
    $expired = Banner::factory()->expired()->create();
    $active = Banner::factory()->create();

    $results = Banner::active()->get();

    expect($results)->toHaveCount(1);
    expect($results->first()->id)->toBe($active->id);
});

it('excludes future-scheduled banners from active scope', function () {
    $future = Banner::factory()->futureScheduled()->create();
    $active = Banner::factory()->create();

    $results = Banner::active()->get();

    expect($results)->toHaveCount(1);
    expect($results->first()->id)->toBe($active->id);
});

// ─── Public Banner Display ─────────

it('shows active banners on article page', function () {
    $post = Post::factory()->published()->create();
    $topBanner = Banner::factory()->articleTop()->create();
    $bottomBanner = Banner::factory()->articleBottom()->create();
    Banner::factory()->inactive()->create();

    $response = $this->get("/article/{$post->slug}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/post-show')
            ->has('topBanners', 1)
            ->has('bottomBanners', 1)
        );
});

it('shows banners on home page', function () {
    Banner::factory()->homeHeroBelow()->create();
    Banner::factory()->homeSidebar()->create();
    Banner::factory()->homeFeedInline()->create();

    $response = $this->get('/');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/home')
            ->has('heroBelowBanners', 1)
            ->has('sidebarBanners', 1)
            ->has('feedInlineBanners', 1)
            ->has('popupBanners', 0)
        );
});

it('shows banners on category page', function () {
    $category = \App\Models\Category::factory()->create();
    Post::factory()->published()->for($category)->create();
    Banner::factory()->categoryTop()->create();
    Banner::factory()->categorySidebar()->create();

    $response = $this->get("/category/{$category->slug}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/category-show')
            ->has('topBanners', 1)
            ->has('sidebarBanners', 1)
        );
});
