<?php

namespace App\Services;

use App\Enums\PointType;
use App\Models\Post;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ViewPointCalculationService
{
    public function __construct(
        protected PointService $pointService
    ) {}

    /**
     * Calculate and award points for a post based on its view count.
     *
     * Formula: floor(views / views_per_point)
     * Cap: max_points_per_article
     */
    public function processPost(Post $post): void
    {
        // Get settings
        $viewsPerPoint = (int) Setting::get('views_per_point', 100);
        $maxPoints = (int) Setting::get('max_points_per_article', 10);

        if ($viewsPerPoint <= 0) {
            return;
        }

        // Calculate total points earned based on current views
        $totalEarned = (int) floor($post->view_count / $viewsPerPoint);

        // Apply cap
        if ($totalEarned > $maxPoints) {
            $totalEarned = $maxPoints;
        }

        // Calculate pending points (gap)
        $pointsToAward = $totalEarned - $post->points_awarded_from_views;

        if ($pointsToAward <= 0) {
            return;
        }

        // Award points transactionally
        DB::transaction(function () use ($post, $pointsToAward, $totalEarned) {
            // Double check strict equality to prevent race conditions if called concurrently
            // (though the command should use withoutOverlapping)

            if ($post->user) {
                $this->pointService->award(
                    user: $post->user,
                    amount: $pointsToAward,
                    type: PointType::Views,
                    description: "Points for {$post->view_count} views on: {$post->title}",
                    relatedModel: $post
                );
            }

            // Update post record
            // We set points_awarded_from_views to the new total to be consistent
            $post->updateQuietly([
                'points_awarded_from_views' => $totalEarned, // or $post->points_awarded_from_views + $pointsToAward
            ]);

            Log::info("Awarded {$pointsToAward} view points for post ID {$post->id}. Total awarded: {$totalEarned}");
        });
    }
}
