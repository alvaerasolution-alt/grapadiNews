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
            ['name' => 'News', 'description' => 'Berita terkini dan informasi terbaru'],
            ['name' => 'Business', 'description' => 'Berita bisnis, ekonomi, dan keuangan'],
            ['name' => 'Sport', 'description' => 'Berita olahraga dan kompetisi'],
            ['name' => 'Tech', 'description' => 'Teknologi, gadget, dan inovasi digital'],
            ['name' => 'Life', 'description' => 'Gaya hidup, tips, dan inspirasi'],
            ['name' => 'Health', 'description' => 'Kesehatan, kebugaran, dan wellness'],
            ['name' => 'Opinion', 'description' => 'Opini, analisis, dan kolom editorial'],
            ['name' => 'Education', 'description' => 'Pendidikan, riset, dan pengembangan ilmu'],
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
