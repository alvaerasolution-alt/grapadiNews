<?php

namespace Database\Seeders;

use App\Models\RedemptionItem;
use Illuminate\Database\Seeder;

class RedemptionItemSeeder extends Seeder
{
    /**
     * Seed the redemption items table with sample items.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'Pulsa Rp25.000',
                'description' => 'Pulsa senilai Rp25.000 untuk semua operator.',
                'point_cost' => 50,
                'rupiah_value' => 25000,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pulsa Rp50.000',
                'description' => 'Pulsa senilai Rp50.000 untuk semua operator.',
                'point_cost' => 100,
                'rupiah_value' => 50000,
                'sort_order' => 2,
            ],
            [
                'name' => 'Transfer Bank Rp100.000',
                'description' => 'Transfer ke rekening bank senilai Rp100.000.',
                'point_cost' => 200,
                'rupiah_value' => 100000,
                'sort_order' => 3,
            ],
            [
                'name' => 'E-Wallet Rp50.000',
                'description' => 'Saldo e-wallet (GoPay/OVO/DANA/ShopeePay) senilai Rp50.000.',
                'point_cost' => 100,
                'rupiah_value' => 50000,
                'sort_order' => 4,
            ],
            [
                'name' => 'Transfer Bank Rp250.000',
                'description' => 'Transfer ke rekening bank senilai Rp250.000.',
                'point_cost' => 500,
                'rupiah_value' => 250000,
                'sort_order' => 5,
            ],
        ];

        foreach ($items as $item) {
            RedemptionItem::firstOrCreate(['name' => $item['name']], $item);
        }
    }
}
