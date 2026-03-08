<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PointSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PointSettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings/points', [
            'settings' => Setting::getPointSettings(),
        ]);
    }

    public function update(PointSettingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            $stringValue = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
            Setting::set($key, $stringValue, 'points');
        }

        Setting::clearCache();

        return redirect()->back()
            ->with('success', 'Pengaturan poin berhasil diperbarui.');
    }
}
