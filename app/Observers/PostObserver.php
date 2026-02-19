<?php

namespace App\Observers;

use App\Enums\PointType;
use App\Enums\PostStatus;
use App\Models\Post;
use App\Services\PointService;
use App\Services\UnsplashService;
use Illuminate\Support\Facades\Log;

class PostObserver
{
    public function __construct(
        protected PointService $pointService,
        protected UnsplashService $unsplashService,
    ) {}

    /**
     * Handle the Post "created" event.
     * Auto-fetch Unsplash image if no featured image is set.
     */
    public function created(Post $post): void
    {
        $this->fetchUnsplashIfNeeded($post);
    }

    /**
     * Handle the Post "updated" event.
     */
    public function updated(Post $post): void
    {
        // Award publish points if status changed to Published
        if ($post->isDirty('status') && $post->status === PostStatus::Published) {
            if ($post->points_awarded_on_publish === 0) {
                $this->awardPublishPoints($post);
            }
        }

        // Fetch Unsplash image if featured image was cleared
        if ($post->isDirty('featured_image') && empty($post->featured_image)) {
            $this->fetchUnsplashIfNeeded($post);
        }
    }

    /**
     * Fetch Unsplash image if no featured image and no unsplash URL.
     */
    protected function fetchUnsplashIfNeeded(Post $post): void
    {
        // Skip if the post already has a featured image or unsplash URL
        if (! empty($post->featured_image) || ! empty($post->unsplash_image_url)) {
            return;
        }

        if (! $this->unsplashService->isConfigured()) {
            return;
        }

        try {
            $post->loadMissing(['category:id,name', 'tags:id,name']);

            $tags = $post->tags->pluck('name')->toArray();
            $categoryName = $post->category?->name;

            $url = $this->unsplashService->searchImage(
                $post->title,
                $categoryName,
                $tags,
            );

            if ($url) {
                $post->updateQuietly(['unsplash_image_url' => $url]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch Unsplash image on post creation', [
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Award points for publishing a post.
     */
    protected function awardPublishPoints(Post $post): void
    {
        $user = $post->user;

        if (! $user) {
            return;
        }

        $points = 10;

        $this->pointService->award(
            $user,
            $points,
            PointType::Publish,
            "Published article: {$post->title}",
            $post
        );

        $post->updateQuietly([
            'points_awarded_on_publish' => $points,
            'published_at' => $post->published_at ?? now(),
        ]);
    }
}
