<?php

namespace App\Jobs;

use App\Models\Post;
use App\Models\PushSubscription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class SendNewPostNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $postId,
    ) {}

    public function handle(): void
    {
        $post = Post::find($this->postId);

        if (! $post) {
            return;
        }

        $vapidPublicKey = config('services.vapid.public_key');
        $vapidPrivateKey = config('services.vapid.private_key');

        if (empty($vapidPublicKey) || empty($vapidPrivateKey)) {
            Log::warning('VAPID keys not configured, skipping push notifications.');

            return;
        }

        $auth = [
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => $vapidPublicKey,
                'privateKey' => $vapidPrivateKey,
            ],
        ];

        try {
            $webPush = new WebPush($auth);

            $payload = json_encode([
                'title' => 'Artikel Baru!',
                'body' => $post->title,
                'url' => "/{$post->slug}",
                'icon' => '/favicon.ico',
            ]);

            $subscriptions = PushSubscription::all();

            foreach ($subscriptions as $sub) {
                $keys = $sub->keys;

                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $keys['p256dh'] ?? '',
                    'authToken' => $keys['auth'] ?? '',
                    'contentEncoding' => $sub->content_encoding ?? 'aesgcm',
                ]);

                $webPush->queueNotification($subscription, $payload);
            }

            foreach ($webPush->flush() as $report) {
                if (! $report->isSuccess()) {
                    $endpoint = $report->getRequest()->getUri()->__toString();

                    // Remove expired subscriptions
                    if ($report->isSubscriptionExpired()) {
                        PushSubscription::where('endpoint', $endpoint)->delete();
                    }

                    Log::warning('Push notification failed', [
                        'endpoint' => $endpoint,
                        'reason' => $report->getReason(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to send push notifications', [
                'post_id' => $this->postId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
