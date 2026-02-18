<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed categories and tags.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Market', 'description' => 'Berita pasar modal, saham, dan investasi'],
            ['name' => 'Bisnis', 'description' => 'Berita bisnis, perusahaan, dan industri'],
            ['name' => 'Finansial', 'description' => 'Keuangan, perbankan, dan ekonomi'],
            ['name' => 'Tech', 'description' => 'Teknologi, gadget, dan inovasi digital'],
            ['name' => 'Insight', 'description' => 'Analisis mendalam dan laporan khusus'],
            ['name' => 'Lifestyle', 'description' => 'Gaya hidup, travel, dan kuliner'],
            ['name' => 'Opini', 'description' => 'Opini, kolom, dan sudut pandang'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }

        $tags = [
            'Laravel', 'React', 'JavaScript', 'PHP', 'Tutorial',
            'Indonesia', 'Startup', 'AI', 'Mobile', 'Web Development',
            'Sepak Bola', 'Basket', 'Ramadan', 'Tips', 'Review',
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(['name' => $tag]);
        }
    }
}
