<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BannerPosition;
use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminBannerController extends Controller
{
    public function index(): Response
    {
        $banners = Banner::query()
            ->orderBy('position')
            ->orderBy('sort_order')
            ->paginate(15);

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'positions' => collect(BannerPosition::cases())->map(fn (BannerPosition $p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/banners/create', [
            'positions' => collect(BannerPosition::cases())->map(fn (BannerPosition $p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ]),
        ]);
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['image'] = ImageHelper::storeAsWebp(
            $request->file('image'),
            'banners',
            quality: 80,
            maxWidth: 1920,
        );

        Banner::create($data);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner berhasil dibuat.');
    }

    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/edit', [
            'banner' => array_merge($banner->toArray(), [
                'starts_at' => $banner->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $banner->ends_at?->format('Y-m-d\TH:i'),
            ]),
            'positions' => collect(BannerPosition::cases())->map(fn (BannerPosition $p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ]),
        ]);
    }

    public function update(BannerRequest $request, Banner $banner): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            ImageHelper::delete($banner->image);

            $data['image'] = ImageHelper::storeAsWebp(
                $request->file('image'),
                'banners',
                quality: 80,
                maxWidth: 1920,
            );
        } else {
            unset($data['image']);
        }

        $banner->update($data);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        ImageHelper::delete($banner->image);

        $banner->delete();

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner berhasil dihapus.');
    }
}
