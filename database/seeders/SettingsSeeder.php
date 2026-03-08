<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Seed the settings table with default point system configuration.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'publish_points_enabled',
                'value' => '1',
                'description' => 'Aktifkan/nonaktifkan pemberian poin saat artikel dipublish',
                'group' => 'points',
            ],
            [
                'key' => 'points_per_publish',
                'value' => '10',
                'description' => 'Poin yang diberikan saat artikel dipublish',
                'group' => 'points',
            ],
            [
                'key' => 'view_points_enabled',
                'value' => '1',
                'description' => 'Aktifkan/nonaktifkan pemberian poin dari views artikel',
                'group' => 'points',
            ],
            [
                'key' => 'views_per_point',
                'value' => '5000',
                'description' => 'Jumlah views yang dibutuhkan untuk mendapatkan 1 poin bonus',
                'group' => 'points',
            ],
            [
                'key' => 'max_points_per_article',
                'value' => '10',
                'description' => 'Batas maksimum poin views per artikel',
                'group' => 'points',
            ],
            [
                'key' => 'rupiah_per_point',
                'value' => '10000',
                'description' => 'Nilai rupiah per 1 poin (untuk estimasi penghasilan)',
                'group' => 'points',
            ],
            [
                'key' => 'max_pending_requests',
                'value' => '1',
                'description' => 'Maksimum jumlah request redemption pending per user',
                'group' => 'points',
            ],
            [
                'key' => 'redemption_cooldown_hours',
                'value' => '24',
                'description' => 'Jam cooldown antara request redemption',
                'group' => 'points',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                $setting,
            );
        }
    }
}
