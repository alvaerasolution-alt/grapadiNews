<?php

use App\Models\PushSubscription;

it('can store a push subscription', function () {
    $response = $this->postJson('/push/subscribe', [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
        'keys' => [
            'p256dh' => 'test-p256dh-key',
            'auth' => 'test-auth-key',
        ],
        'content_encoding' => 'aesgcm',
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    expect(PushSubscription::where('endpoint', 'https://fcm.googleapis.com/fcm/send/test-endpoint-123')->exists())->toBeTrue();
});

it('handles duplicate endpoint gracefully via upsert', function () {
    PushSubscription::create([
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-456',
        'keys' => ['p256dh' => 'old-key', 'auth' => 'old-auth'],
        'content_encoding' => 'aesgcm',
    ]);

    $response = $this->postJson('/push/subscribe', [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-456',
        'keys' => [
            'p256dh' => 'new-key',
            'auth' => 'new-auth',
        ],
        'content_encoding' => 'aesgcm',
    ]);

    $response->assertOk();

    $sub = PushSubscription::where('endpoint', 'https://fcm.googleapis.com/fcm/send/test-endpoint-456')->first();
    expect($sub->keys['p256dh'])->toBe('new-key');
    expect(PushSubscription::where('endpoint', 'https://fcm.googleapis.com/fcm/send/test-endpoint-456')->count())->toBe(1);
});

it('can remove a push subscription', function () {
    PushSubscription::create([
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-789',
        'keys' => ['p256dh' => 'test', 'auth' => 'test'],
        'content_encoding' => 'aesgcm',
    ]);

    $response = $this->postJson('/push/unsubscribe', [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-789',
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    expect(PushSubscription::where('endpoint', 'https://fcm.googleapis.com/fcm/send/test-endpoint-789')->exists())->toBeFalse();
});

it('validates subscription endpoint is required', function () {
    $response = $this->postJson('/push/subscribe', [
        'keys' => [
            'p256dh' => 'test',
            'auth' => 'test',
        ],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('endpoint');
});
