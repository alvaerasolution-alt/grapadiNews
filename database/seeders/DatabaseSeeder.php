<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            CategorySeeder::class,
            SettingsSeeder::class,
            RedemptionItemSeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin GrapadiNews',
            'email' => 'admin@grapadinews.com',
        ]);
        $admin->assignRole('admin');

        $contributor = User::factory()->create([
            'name' => 'Contributor',
            'email' => 'contributor@grapadinews.com',
            'points' => 250,
        ]);
        $contributor->assignRole('contributor');
    }
}
