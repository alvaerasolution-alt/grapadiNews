<?php

namespace App\Observers;

use App\Enums\PointType;
use App\Enums\PostStatus;
use App\Models\Post;
use App\Services\PointService;

class PostObserver
{
    public function __construct(
        protected PointService $pointService
    ) {}

    /**
     * Handle the Post "updated" event.
     */
    public function updated(Post $post): void
    {
        // Only trigger if status changed to Published
        if ($post->isDirty('status') && $post->status === PostStatus::Published) {

            // Ensure points haven't been awarded yet for this publish
            // We check 'points_awarded_on_publish' column which stores the amount given.
            // If it's 0, it means no points given yet.
            if ($post->points_awarded_on_publish === 0) {
                $this->awardPublishPoints($post);
            }
        }
    }

    /**
     * Award points for publishing a post.
     */
    protected function awardPublishPoints(Post $post): void
    {
        // Get user
        $user = $post->user;

        if (! $user) {
            return;
        }

        // Default points per publish
        $points = 10;

        // Award points
        $this->pointService->award(
            $user,
            $points,
            PointType::Publish,
            "Published article: {$post->title}",
            $post
        );

        // Update post without triggering events
        $post->updateQuietly([
            'points_awarded_on_publish' => $points,
            'published_at' => $post->published_at ?? now(),
        ]);
    }
}
