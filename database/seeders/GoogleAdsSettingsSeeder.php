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
                'key' => 'mgid_site_id',
                'value' => '',
                'description' => 'MGID Site ID — domain Anda yang terdaftar di MGID (contoh: site.com). Kosongkan jika belum ada.',
            ],
            [
                'key' => 'mgid_widget_article_top',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Atas Artikel.',
            ],
            [
                'key' => 'mgid_widget_article_bottom',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Bawah Artikel.',
            ],
            [
                'key' => 'mgid_widget_home_hero_below',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Home — Bawah Hero.',
            ],
            [
                'key' => 'mgid_widget_home_sidebar',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Home — Sidebar.',
            ],
            [
                'key' => 'mgid_widget_home_feed_inline',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Home — Sisipan Feed.',
            ],
            [
                'key' => 'mgid_widget_category_top',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Kategori — Atas.',
            ],
            [
                'key' => 'mgid_widget_category_sidebar',
                'value' => '',
                'description' => 'MGID Widget ID untuk slot Kategori — Sidebar.',
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
