<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class WebSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $webSettings = [
            [
                'key' => 'site_name',
                'value' => 'GrapadiNews',
                'description' => 'Nama website yang ditampilkan di navbar dan footer',
                'group' => 'web',
            ],
            [
                'key' => 'site_tagline',
                'value' => 'Platform berita dan artikel terkini, terpercaya, dan informatif untuk generasi digital Indonesia.',
                'description' => 'Tagline website yang ditampilkan di footer',
                'group' => 'web',
            ],
            [
                'key' => 'footer_text',
                'value' => 'Platform berita dan artikel terkini, terpercaya, dan informatif untuk generasi digital Indonesia.',
                'description' => 'Teks footer website',
                'group' => 'web',
            ],
            [
                'key' => 'site_logo',
                'value' => '',
                'description' => 'Logo website (SVG, PNG, JPG)',
                'group' => 'web',
            ],
            [
                'key' => 'favicon',
                'value' => '',
                'description' => 'Favicon website (ICO, PNG)',
                'group' => 'web',
            ],
            [
                'key' => 'social_facebook',
                'value' => '',
                'description' => 'URL Facebook page',
                'group' => 'web',
            ],
            [
                'key' => 'social_instagram',
                'value' => '',
                'description' => 'URL Instagram profile',
                'group' => 'web',
            ],
            [
                'key' => 'social_twitter',
                'value' => '',
                'description' => 'URL Twitter/X profile',
                'group' => 'web',
            ],
            [
                'key' => 'social_youtube',
                'value' => '',
                'description' => 'URL YouTube channel',
                'group' => 'web',
            ],
            [
                'key' => 'social_tiktok',
                'value' => '',
                'description' => 'URL TikTok profile',
                'group' => 'web',
            ],
            [
                'key' => 'social_linkedin',
                'value' => '',
                'description' => 'URL LinkedIn page',
                'group' => 'web',
            ],
        ];

        foreach ($webSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
