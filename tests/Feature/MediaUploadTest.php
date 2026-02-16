<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot upload images', function () {
    $response = $this->post(route('media.upload'), [
        'image' => UploadedFile::fake()->image('test.jpg'),
    ], ['Accept' => 'application/json']);

    $response->assertUnauthorized();
});

test('authenticated users can upload images', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('post-image.jpg', 800, 600);

    $response = $this->actingAs($user)
        ->post(route('media.upload'), [
            'image' => $file,
        ], ['Accept' => 'application/json']);

    $response->assertOk()
        ->assertJsonStructure([
            'urls' => ['original', 'thumbnail', 'medium'],
            'paths' => ['original', 'thumbnail', 'medium'],
        ]);

    $paths = $response->json('paths');

    // Verify files are stored
    foreach ($paths as $path) {
        Storage::disk('public')->assertExists($path);
        // Ensure extension is webp (our service converts it)
        expect($path)->toBeString()->toEndWith('.webp');
    }
});

test('image validation rules', function () {
    $user = User::factory()->create();

    // No file
    $this->actingAs($user)
        ->post(route('media.upload'), [], ['Accept' => 'application/json'])
        ->assertJsonValidationErrors(['image']);

    // Not an image
    $this->actingAs($user)
        ->post(route('media.upload'), [
            'image' => UploadedFile::fake()->create('document.pdf', 100),
        ], ['Accept' => 'application/json'])
        ->assertJsonValidationErrors(['image']);

    // Too large (> 5MB)
    // We simulate a large file size
    $this->actingAs($user)
        ->post(route('media.upload'), [
            'image' => UploadedFile::fake()->create('large.jpg', 6000), // 6MB
        ], ['Accept' => 'application/json'])
        ->assertJsonValidationErrors(['image']);
});
