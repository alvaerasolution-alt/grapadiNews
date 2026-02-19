<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Services\UnsplashService;
use Illuminate\Console\Command;

class FetchUnsplashImages extends Command
{
    protected $signature = 'posts:fetch-unsplash-images
                            {--limit=50 : Number of posts to process per run}
                            {--force : Re-fetch images even if already set}';

    protected $description = 'Fetch Unsplash images for posts that have no featured image or unsplash URL';

    public function handle(UnsplashService $unsplash): int
    {
        if (! $unsplash->isConfigured()) {
            $this->error('Unsplash access key not configured. Set UNSPLASH_ACCESS_KEY in .env');

            return self::FAILURE;
        }

        $limit = (int) $this->option('limit');
        $force = $this->option('force');

        $query = Post::query()
            ->with(['category:id,name', 'tags:id,name'])
            ->whereNull('featured_image')
            ->orWhere('featured_image', '');

        if (! $force) {
            $query->where(function ($q) {
                $q->whereNull('unsplash_image_url')
                    ->orWhere('unsplash_image_url', '');
            });
        }

        $posts = $query->take($limit)->get();

        if ($posts->isEmpty()) {
            $this->info('No posts need Unsplash images.');

            return self::SUCCESS;
        }

        $this->info("Processing {$posts->count()} posts...");
        $bar = $this->output->createProgressBar($posts->count());
        $bar->start();

        $fetched = 0;
        $failed = 0;
        $usedImages = [];

        foreach ($posts as $post) {
            $tags = $post->tags->pluck('name')->toArray();
            $categoryName = $post->category?->name;

            $url = $unsplash->searchImage(
                $post->title,
                $categoryName,
                $tags,
                $usedImages,
            );

            if ($url) {
                $post->update(['unsplash_image_url' => $url]);
                $usedImages[] = $url;
                $fetched++;
            } else {
                $failed++;
            }

            $bar->advance();

            // Rate limit: Unsplash free tier allows 50 requests/hour
            usleep(200000); // 200ms delay between requests
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Done! Fetched: {$fetched}, Failed: {$failed}");

        return self::SUCCESS;
    }
}
