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
                'key' => 'points_per_publish',
                'value' => '10',
                'description' => 'Poin yang diberikan saat artikel dipublish',
            ],
            [
                'key' => 'views_per_point',
                'value' => '100',
                'description' => 'Jumlah views yang dibutuhkan untuk mendapatkan 1 poin bonus',
            ],
            [
                'key' => 'max_points_per_article',
                'value' => '10',
                'description' => 'Batas maksimum poin views per artikel',
            ],
            [
                'key' => 'max_pending_requests',
                'value' => '1',
                'description' => 'Maksimum jumlah request redemption pending per user',
            ],
            [
                'key' => 'redemption_cooldown_hours',
                'value' => '24',
                'description' => 'Jam cooldown antara request redemption',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
