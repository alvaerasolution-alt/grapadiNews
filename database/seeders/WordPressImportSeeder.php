<?php

namespace Database\Seeders;

use App\Enums\PostStatus;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WordPressImportSeeder extends Seeder
{
    public function run(): void
    {
        $file = database_path('seeders/data/wp_articles.json');

        if (! file_exists($file)) {
            $this->command->error("File not found: {$file}");
            $this->command->info('Run: python3 database/seeders/scripts/extract_wp_articles.py');

            return;
        }

        $articles = json_decode(file_get_contents($file), true);

        if (empty($articles)) {
            $this->command->error('No articles found in JSON file.');

            return;
        }

        // Get first admin user as the author for all imported posts
        $user = User::role('admin')->first() ?? User::first();

        if (! $user) {
            $this->command->error('No users found. Please create a user first.');

            return;
        }

        // Load categories (create if not exists)
        $categories = [];
        foreach (['Market', 'Bisnis', 'Finansial', 'Tech', 'Insight', 'Lifestyle', 'Opini'] as $catName) {
            $categories[$catName] = Category::firstOrCreate(
                ['name' => $catName],
                ['slug' => Str::slug($catName)]
            );
        }

        // Delete existing posts
        $this->command->info('Deleting existing posts...');
        DB::table('post_tag')->truncate();
        Post::query()->delete();

        // Reset auto-increment
        DB::statement('ALTER TABLE posts AUTO_INCREMENT = 1');

        $count = count($articles);
        $this->command->info("Importing {$count} articles...");

        $bar = $this->command->getOutput()->createProgressBar($count);
        $bar->start();

        $imported = 0;
        $skipped = 0;

        // Use chunked insert for performance
        $chunks = array_chunk($articles, 50);

        foreach ($chunks as $chunk) {
            $rows = [];

            foreach ($chunk as $article) {
                $catName = $article['category'] ?? 'Insight';
                $category = $categories[$catName] ?? $categories['Insight'];

                $status = $article['status'] === 'published'
                    ? PostStatus::Published->value
                    : PostStatus::Draft->value;

                // Ensure slug is unique
                $slug = Str::slug($article['slug']);
                if (empty($slug)) {
                    $slug = Str::slug($article['title']);
                }
                if (empty($slug)) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }

                // Check for existing slug
                $existingSlug = Post::where('slug', $slug)->exists();
                if ($existingSlug) {
                    $slug = $slug.'-'.Str::random(4);
                }

                $publishedAt = null;
                if (! empty($article['published_at']) && $article['published_at'] !== '0000-00-00 00:00:00') {
                    try {
                        $publishedAt = \Carbon\Carbon::parse($article['published_at']);
                    } catch (\Exception $e) {
                        $publishedAt = null;
                    }
                }

                $title = mb_substr($article['title'], 0, 255);
                $excerpt = mb_substr($article['excerpt'] ?? '', 0, 500);

                Post::create([
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'title' => $title,
                    'slug' => $slug,
                    'excerpt' => $excerpt ?: null,
                    'body' => $article['body'],
                    'featured_image' => null,
                    'status' => $status,
                    'meta_title' => $title,
                    'meta_description' => $excerpt ?: null,
                    'view_count' => $article['view_count'] ?? 0,
                    'published_at' => $publishedAt,
                ]);

                $imported++;
                $bar->advance();
            }
        }

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info("Import complete! {$imported} articles imported, {$skipped} skipped.");

        // Show category breakdown
        $this->command->table(
            ['Category', 'Count'],
            Category::withCount('posts')->get()->map(fn ($c) => [$c->name, $c->posts_count])->toArray()
        );
    }
}
