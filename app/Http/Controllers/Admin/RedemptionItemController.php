<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RedemptionItemRequest;
use App\Models\RedemptionItem;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RedemptionItemController extends Controller
{
    public function index(): Response
    {
        $items = RedemptionItem::query()
            ->withCount('redemptionRequests')
            ->orderBy('sort_order')
            ->paginate(15);

        return Inertia::render('admin/redemption-items/index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/redemption-items/create');
    }

    public function store(RedemptionItemRequest $request): RedirectResponse
    {
        RedemptionItem::create($request->validated());

        return redirect()->route('admin.redemption-items.index')
            ->with('success', 'Item penukaran berhasil dibuat.');
    }

    public function edit(RedemptionItem $redemptionItem): Response
    {
        return Inertia::render('admin/redemption-items/edit', [
            'item' => $redemptionItem,
        ]);
    }

    public function update(RedemptionItemRequest $request, RedemptionItem $redemptionItem): RedirectResponse
    {
        $redemptionItem->update($request->validated());

        return redirect()->route('admin.redemption-items.index')
            ->with('success', 'Item penukaran berhasil diperbarui.');
    }

    public function destroy(RedemptionItem $redemptionItem): RedirectResponse
    {
        if ($redemptionItem->redemptionRequests()->exists()) {
            return redirect()->back()
                ->with('error', 'Tidak dapat menghapus item yang memiliki permintaan.');
        }

        $redemptionItem->delete();

        return redirect()->route('admin.redemption-items.index')
            ->with('success', 'Item penukaran berhasil dihapus.');
    }
}
