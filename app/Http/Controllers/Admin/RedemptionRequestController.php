<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RedemptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRedemptionStatusRequest;
use App\Models\RedemptionRequest;
use App\Services\RedemptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RedemptionRequestController extends Controller
{
    public function __construct(
        private RedemptionService $redemptionService,
    ) {}

    public function index(Request $request): Response
    {
        $query = RedemptionRequest::query()
            ->with(['user:id,name,email', 'redemptionItem:id,name'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/redemption-requests/index', [
            'requests' => $requests->through(fn (RedemptionRequest $req) => [
                'id' => $req->id,
                'user' => [
                    'id' => $req->user->id,
                    'name' => $req->user->name,
                    'email' => $req->user->email,
                ],
                'item_name' => $req->redemptionItem->name,
                'point_cost' => $req->point_cost,
                'rupiah_value' => $req->rupiah_value,
                'payment_method' => $req->payment_method->value,
                'payment_method_label' => $req->payment_method->label(),
                'status' => $req->status->value,
                'status_label' => $req->status->label(),
                'created_at' => $req->created_at->toISOString(),
                'created_at_human' => $req->created_at->diffForHumans(),
            ]),
            'statuses' => collect(RedemptionStatus::cases())->map(fn (RedemptionStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
            'currentStatus' => $request->input('status', ''),
        ]);
    }

    public function show(RedemptionRequest $redemptionRequest): Response
    {
        $redemptionRequest->load(['user:id,name,email', 'redemptionItem', 'processor:id,name']);

        return Inertia::render('admin/redemption-requests/show', [
            'redemptionRequest' => [
                'id' => $redemptionRequest->id,
                'user' => [
                    'id' => $redemptionRequest->user->id,
                    'name' => $redemptionRequest->user->name,
                    'email' => $redemptionRequest->user->email,
                ],
                'item' => [
                    'id' => $redemptionRequest->redemptionItem->id,
                    'name' => $redemptionRequest->redemptionItem->name,
                    'description' => $redemptionRequest->redemptionItem->description,
                ],
                'point_cost' => $redemptionRequest->point_cost,
                'rupiah_value' => $redemptionRequest->rupiah_value,
                'payment_method' => $redemptionRequest->payment_method->value,
                'payment_method_label' => $redemptionRequest->payment_method->label(),
                'bank_name' => $redemptionRequest->bank_name,
                'account_number' => $redemptionRequest->account_number,
                'account_holder' => $redemptionRequest->account_holder,
                'ewallet_provider' => $redemptionRequest->ewallet_provider,
                'ewallet_number' => $redemptionRequest->ewallet_number,
                'ewallet_name' => $redemptionRequest->ewallet_name,
                'status' => $redemptionRequest->status->value,
                'status_label' => $redemptionRequest->status->label(),
                'admin_note' => $redemptionRequest->admin_note,
                'processor' => $redemptionRequest->processor ? [
                    'name' => $redemptionRequest->processor->name,
                ] : null,
                'processed_at' => $redemptionRequest->processed_at?->toISOString(),
                'created_at' => $redemptionRequest->created_at->toISOString(),
                'created_at_human' => $redemptionRequest->created_at->diffForHumans(),
            ],
            'availableStatuses' => collect(RedemptionStatus::cases())
                ->filter(fn (RedemptionStatus $s) => $s !== RedemptionStatus::Pending)
                ->values()
                ->map(fn (RedemptionStatus $s) => [
                    'value' => $s->value,
                    'label' => $s->label(),
                ]),
        ]);
    }

    public function updateStatus(
        UpdateRedemptionStatusRequest $request,
        RedemptionRequest $redemptionRequest,
    ): RedirectResponse {
        $newStatus = RedemptionStatus::from($request->validated('status'));

        $this->redemptionService->updateStatus(
            $redemptionRequest,
            $newStatus,
            $request->user(),
            $request->validated('admin_note'),
        );

        return redirect()->route('admin.redemption-requests.index')
            ->with('success', 'Status permintaan berhasil diperbarui.');
    }
}
