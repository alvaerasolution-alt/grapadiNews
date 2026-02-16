<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class GoogleAdsSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'google_adsense_publisher_id',
                'value' => '',
                'description' => 'Google AdSense Publisher ID (contoh: ca-pub-1234567890123456). Kosongkan jika belum ada.',
            ],
            [
                'key' => 'google_ad_slot_article_top',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Atas Artikel.',
            ],
            [
                'key' => 'google_ad_slot_article_bottom',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Bawah Artikel.',
            ],
            [
                'key' => 'google_ad_slot_home_hero_below',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Home — Bawah Hero.',
            ],
            [
                'key' => 'google_ad_slot_home_sidebar',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Home — Sidebar.',
            ],
            [
                'key' => 'google_ad_slot_home_feed_inline',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Home — Sisipan Feed.',
            ],
            [
                'key' => 'google_ad_slot_category_top',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Kategori — Atas.',
            ],
            [
                'key' => 'google_ad_slot_category_sidebar',
                'value' => '',
                'description' => 'Ad Unit ID untuk slot Kategori — Sidebar.',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'description' => $setting['description'],
                ],
            );
        }
    }
}
