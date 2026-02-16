<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\Setting;
use App\Models\Tag;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('auto-generates a slug from name on creation', function () {
    $category = Category::factory()->create(['name' => 'Web Development']);

    expect($category->slug)->toBe('web-development');
});

it('has many posts', function () {
    $category = Category::factory()->create();
    Post::factory()->count(3)->create(['category_id' => $category->id]);

    expect($category->posts)->toHaveCount(3);
});

it('generates unique slugs for tags with same name', function () {
    $tag1 = Tag::factory()->create(['name' => 'Laravel']);
    $tag2 = Tag::factory()->create(['name' => 'Laravel']);

    expect($tag1->slug)->toBe('laravel');
    expect($tag2->slug)->toBe('laravel-1');
});

it('can get and set settings with caching', function () {
    Setting::set('test_key', '42');

    expect(Setting::get('test_key'))->toBe('42');
});

it('returns default when setting key does not exist', function () {
    expect(Setting::get('nonexistent_key', 'default'))->toBe('default');
});

it('updates existing setting value', function () {
    Setting::set('test_key', 'original');
    Setting::set('test_key', 'updated');

    expect(Setting::get('test_key'))->toBe('updated');
});
