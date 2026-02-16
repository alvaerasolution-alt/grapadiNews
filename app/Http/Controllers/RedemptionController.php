<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Exceptions\CooldownActiveException;
use App\Exceptions\InsufficientPointsException;
use App\Exceptions\MaxPendingRequestsException;
use App\Http\Requests\RedemptionRequest as RedemptionFormRequest;
use App\Models\RedemptionItem;
use App\Models\RedemptionRequest;
use App\Services\RedemptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RedemptionController extends Controller
{
    public function __construct(
        private RedemptionService $redemptionService,
    ) {}

    /**
     * Display the redemption catalog.
     */
    public function index(Request $request): Response
    {
        $items = RedemptionItem::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('point_cost')
            ->get();

        return Inertia::render('redemptions/index', [
            'items' => $items,
            'userPoints' => $request->user()->points,
        ]);
    }

    /**
     * Show the redemption form for a specific item.
     */
    public function create(Request $request, RedemptionItem $redemptionItem): Response
    {
        return Inertia::render('redemptions/create', [
            'item' => $redemptionItem,
            'userPoints' => $request->user()->points,
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $method) => [
                'value' => $method->value,
                'label' => $method->label(),
            ]),
        ]);
    }

    /**
     * Submit a new redemption request.
     */
    public function store(RedemptionFormRequest $request, RedemptionItem $redemptionItem): RedirectResponse
    {
        try {
            $this->redemptionService->submit(
                $request->user(),
                $redemptionItem,
                [
                    'payment_method' => PaymentMethod::from($request->validated('payment_method')),
                    'bank_name' => $request->validated('bank_name'),
                    'account_number' => $request->validated('account_number'),
                    'account_holder' => $request->validated('account_holder'),
                    'ewallet_provider' => $request->validated('ewallet_provider'),
                    'ewallet_number' => $request->validated('ewallet_number'),
                    'ewallet_name' => $request->validated('ewallet_name'),
                ],
            );

            return redirect()->route('redemptions.history')
                ->with('success', 'Permintaan penukaran berhasil diajukan.');
        } catch (InsufficientPointsException|MaxPendingRequestsException|CooldownActiveException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Show the user's redemption history.
     */
    public function history(Request $request): Response
    {
        $requests = RedemptionRequest::query()
            ->where('user_id', $request->user()->id)
            ->with('redemptionItem:id,name')
            ->latest()
            ->paginate(15);

        return Inertia::render('redemptions/history', [
            'requests' => $requests->through(fn (RedemptionRequest $req) => [
                'id' => $req->id,
                'item_name' => $req->redemptionItem->name,
                'point_cost' => $req->point_cost,
                'rupiah_value' => $req->rupiah_value,
                'payment_method' => $req->payment_method->value,
                'payment_method_label' => $req->payment_method->label(),
                'status' => $req->status->value,
                'status_label' => $req->status->label(),
                'admin_note' => $req->admin_note,
                'created_at' => $req->created_at->toISOString(),
                'created_at_human' => $req->created_at->diffForHumans(),
                'processed_at' => $req->processed_at?->toISOString(),
            ]),
            'userPoints' => $request->user()->points,
        ]);
    }
}
