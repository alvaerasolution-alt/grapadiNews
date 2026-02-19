<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebSettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::getWebSettings();

        return Inertia::render('admin/settings/web', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:50',
            'site_tagline' => 'nullable|string|max:150',
            'footer_text' => 'nullable|string|max:500',
            'site_logo' => 'nullable|image|mimes:svg,png,jpg,jpeg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:1024',
            'social_facebook' => 'nullable|url|max:255',
            'social_instagram' => 'nullable|url|max:255',
            'social_twitter' => 'nullable|url|max:255',
            'social_youtube' => 'nullable|url|max:255',
            'social_tiktok' => 'nullable|url|max:255',
            'social_linkedin' => 'nullable|url|max:255',
        ]);

        // Handle site logo upload
        if ($request->hasFile('site_logo')) {
            // Delete old logo if exists
            $oldLogo = Setting::get('site_logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }

            $logoPath = $request->file('site_logo')->store('logos', 'public');
            Setting::set('site_logo', $logoPath, 'web');
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            // Delete old favicon if exists
            $oldFavicon = Setting::get('favicon');
            if ($oldFavicon && Storage::disk('public')->exists($oldFavicon)) {
                Storage::disk('public')->delete($oldFavicon);
            }

            $faviconPath = $request->file('favicon')->store('logos', 'public');
            Setting::set('favicon', $faviconPath, 'web');
        }

        // Update text settings
        Setting::set('site_name', $validated['site_name'], 'web');
        Setting::set('site_tagline', $validated['site_tagline'] ?? '', 'web');
        Setting::set('footer_text', $validated['footer_text'] ?? '', 'web');

        // Update social media settings
        Setting::set('social_facebook', $validated['social_facebook'] ?? '', 'web');
        Setting::set('social_instagram', $validated['social_instagram'] ?? '', 'web');
        Setting::set('social_twitter', $validated['social_twitter'] ?? '', 'web');
        Setting::set('social_youtube', $validated['social_youtube'] ?? '', 'web');
        Setting::set('social_tiktok', $validated['social_tiktok'] ?? '', 'web');
        Setting::set('social_linkedin', $validated['social_linkedin'] ?? '', 'web');

        // Clear cache
        Setting::clearCache();

        return redirect()->route('admin.settings.web')
            ->with('success', 'Web settings updated successfully.');
    }

    public function destroyLogo()
    {
        $logoPath = Setting::get('site_logo');

        if ($logoPath && Storage::disk('public')->exists($logoPath)) {
            Storage::disk('public')->delete($logoPath);
        }

        Setting::set('site_logo', '', 'web');
        Setting::clearCache();

        return redirect()->route('admin.settings.web')
            ->with('success', 'Logo removed successfully.');
    }

    public function destroyFavicon()
    {
        $faviconPath = Setting::get('favicon');

        if ($faviconPath && Storage::disk('public')->exists($faviconPath)) {
            Storage::disk('public')->delete($faviconPath);
        }

        Setting::set('favicon', '', 'web');
        Setting::clearCache();

        return redirect()->route('admin.settings.web')
            ->with('success', 'Favicon removed successfully.');
    }
}
