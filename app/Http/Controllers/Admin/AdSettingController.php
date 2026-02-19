<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdSettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::getAdSettings();

        return Inertia::render('admin/settings/ads', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mgid_site_id' => 'nullable|string|max:255',
            'mgid_widget_article_top' => 'nullable|string|max:255',
            'mgid_widget_article_bottom' => 'nullable|string|max:255',
            'mgid_widget_home_hero_below' => 'nullable|string|max:255',
            'mgid_widget_home_sidebar' => 'nullable|string|max:255',
            'mgid_widget_home_feed_inline' => 'nullable|string|max:255',
            'mgid_widget_category_top' => 'nullable|string|max:255',
            'mgid_widget_category_sidebar' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '', 'ads');
        }

        Setting::clearCache();

        return redirect()->route('admin.settings.ads')
            ->with('success', 'Ads settings updated successfully.');
    }
}
