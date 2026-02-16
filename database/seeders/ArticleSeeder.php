<?php

namespace Database\Seeders;

use App\Enums\PostStatus;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        $users = User::all();
        $tags = Tag::all();

        if ($categories->isEmpty()) {
            $this->command->error('No categories found. Please seed categories first.');

            return;
        }

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please seed users first.');

            return;
        }

        $this->command->info('Creating 120 articles across all categories...');

        $perCategory = (int) ceil(120 / $categories->count());

        $categories->each(function (Category $category) use ($users, $tags, $perCategory) {
            Post::factory()
                ->count($perCategory)
                ->sequence(fn ($sequence) => [
                    'user_id' => $users->random()->id,
                    'category_id' => $category->id,
                    'published_at' => now()->subDays(rand(0, 90))->subHours(rand(0, 23)),
                    'view_count' => rand(5, 5000),
                    'status' => PostStatus::Published,
                    'featured_image' => 'https://picsum.photos/seed/'.($sequence->index + $category->id * 100).'/800/450',
                    'body' => $this->generateRichBody(),
                ])
                ->create()
                ->each(function (Post $post) use ($tags) {
                    if ($tags->isNotEmpty()) {
                        $post->tags()->attach(
                            $tags->random(min(rand(1, 3), $tags->count()))->pluck('id')
                        );
                    }
                });
        });

        $totalCreated = Post::where('status', PostStatus::Published)->count();
        $this->command->info("Done! Total published articles: {$totalCreated}");
    }

    private function generateRichBody(): string
    {
        $paragraphs = fake()->paragraphs(rand(5, 10));
        $body = '';

        foreach ($paragraphs as $i => $paragraph) {
            if ($i === 2) {
                $body .= '<h2>'.fake()->sentence(4).'</h2>';
            }
            if ($i === 5) {
                $body .= '<h3>'.fake()->sentence(3).'</h3>';
            }
            if ($i === 3) {
                $body .= '<blockquote><p>'.fake()->sentence(10).'</p></blockquote>';
            }

            $body .= '<p>'.$paragraph.'</p>';
        }

        // Add a bullet list
        $body .= '<ul>';
        for ($j = 0; $j < rand(3, 5); $j++) {
            $body .= '<li>'.fake()->sentence().'</li>';
        }
        $body .= '</ul>';

        $body .= '<p>'.fake()->paragraph().'</p>';

        return $body;
    }
}
