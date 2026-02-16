<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\PointType;
use App\Enums\RedemptionStatus;
use App\Exceptions\CooldownActiveException;
use App\Exceptions\InsufficientPointsException;
use App\Exceptions\MaxPendingRequestsException;
use App\Models\RedemptionItem;
use App\Models\RedemptionRequest;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RedemptionService
{
    public function __construct(
        private PointService $pointService,
    ) {}

    /**
     * Submit a new redemption request.
     *
     * @param array{
     *     payment_method: PaymentMethod,
     *     bank_name?: string|null,
     *     account_number?: string|null,
     *     account_holder?: string|null,
     *     ewallet_provider?: string|null,
     *     ewallet_number?: string|null,
     *     ewallet_name?: string|null,
     * } $paymentData
     */
    public function submit(User $user, RedemptionItem $item, array $paymentData): RedemptionRequest
    {
        $this->validateCanRedeem($user, $item);

        return DB::transaction(function () use ($user, $item, $paymentData) {
            // Deduct points first
            $this->pointService->deduct(
                $user,
                $item->point_cost,
                PointType::Redemption,
                "Penukaran poin: {$item->name}",
            );

            // Create the request
            return RedemptionRequest::create([
                'user_id' => $user->id,
                'redemption_item_id' => $item->id,
                'point_cost' => $item->point_cost,
                'rupiah_value' => $item->rupiah_value,
                'payment_method' => $paymentData['payment_method'],
                'bank_name' => $paymentData['bank_name'] ?? null,
                'account_number' => $paymentData['account_number'] ?? null,
                'account_holder' => $paymentData['account_holder'] ?? null,
                'ewallet_provider' => $paymentData['ewallet_provider'] ?? null,
                'ewallet_number' => $paymentData['ewallet_number'] ?? null,
                'ewallet_name' => $paymentData['ewallet_name'] ?? null,
                'status' => RedemptionStatus::Pending,
            ]);
        });
    }

    /**
     * Update the status of a redemption request (admin action).
     */
    public function updateStatus(
        RedemptionRequest $request,
        RedemptionStatus $newStatus,
        User $admin,
        ?string $adminNote = null,
    ): RedemptionRequest {
        return DB::transaction(function () use ($request, $newStatus, $admin, $adminNote) {
            // If rejecting, refund points
            if ($newStatus === RedemptionStatus::Rejected) {
                $this->refundPoints($request);
            }

            $request->update([
                'status' => $newStatus,
                'admin_note' => $adminNote,
                'processed_by' => $admin->id,
                'processed_at' => now(),
            ]);

            return $request->fresh();
        });
    }

    /**
     * Validate whether the user is eligible to redeem.
     */
    private function validateCanRedeem(User $user, RedemptionItem $item): void
    {
        // Check sufficient balance
        if ($user->points < $item->point_cost) {
            throw new InsufficientPointsException($item->point_cost, $user->points);
        }

        // Check max pending requests
        $maxPending = (int) Setting::get('max_pending_requests', 1);
        $currentPending = RedemptionRequest::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [RedemptionStatus::Pending, RedemptionStatus::Processing])
            ->count();

        if ($currentPending >= $maxPending) {
            throw new MaxPendingRequestsException($maxPending);
        }

        // Check cooldown
        $cooldownHours = (int) Setting::get('redemption_cooldown_hours', 24);
        $lastRequest = RedemptionRequest::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        if ($lastRequest && $lastRequest->created_at->diffInHours(now()) < $cooldownHours) {
            $remainingHours = $cooldownHours - $lastRequest->created_at->diffInHours(now());
            throw new CooldownActiveException((int) ceil($remainingHours));
        }
    }

    /**
     * Refund points when a request is rejected.
     */
    private function refundPoints(RedemptionRequest $request): void
    {
        $user = $request->user;

        $this->pointService->award(
            $user,
            $request->point_cost,
            PointType::Refund,
            "Pengembalian poin: permintaan #{$request->id} ditolak",
        );
    }
}
