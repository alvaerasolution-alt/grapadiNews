<?php

namespace App\Services;

use App\Enums\PointType;
use App\Models\PointLog;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PointService
{
    /**
     * Award points to a user.
     */
    public function award(
        User $user,
        int $amount,
        PointType $type,
        string $description,
        ?Model $relatedModel = null
    ): PointLog {
        return DB::transaction(function () use ($user, $amount, $type, $description, $relatedModel) {
            $log = PointLog::create([
                'user_id' => $user->id,
                'points' => $amount,
                'type' => $type,
                'reason' => $description,
                'post_id' => $relatedModel instanceof Post ? $relatedModel->id : null,
            ]);

            $user->increment('points', $amount);

            return $log;
        });
    }

    /**
     * Deduct points from a user.
     */
    public function deduct(
        User $user,
        int $amount,
        PointType $type,
        string $description,
        ?Model $relatedModel = null
    ): PointLog {
        // Ensure user has enough points
        if ($user->points < $amount) {
            throw new InsufficientPointsException($amount, $user->points);
        }

        return DB::transaction(function () use ($user, $amount, $type, $description, $relatedModel) {
            $log = PointLog::create([
                'user_id' => $user->id,
                'points' => -$amount, // Negative amount for deduction
                'type' => $type,
                'reason' => $description,
                'post_id' => $relatedModel instanceof Post ? $relatedModel->id : null,
            ]);

            $user->decrement('points', $amount);

            return $log;
        });
    }
}
