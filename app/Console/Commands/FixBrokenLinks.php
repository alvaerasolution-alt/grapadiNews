<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;

class FixBrokenLinks extends Command
{
    protected $signature = 'fix:broken-links
                            {--dry-run : Show what would be fixed without changing data}
                            {--limit= : Limit number of posts to fix}
                            {--post= : Fix a specific post by ID}';

    protected $description = 'Fix broken hyperlinks in post content caused by escaped quotes from WordPress import';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $postId = $this->option('post') ? (int) $this->option('post') : null;

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be changed');
            $this->newLine();
        }

        $this->info('Scanning for posts with broken links...');
        $this->newLine();

        // Build query for affected posts
        // Looking for escaped quotes pattern: \"
        $query = Post::query();

        if ($postId) {
            $query->where('id', $postId);
        } else {
            // Match posts containing backslash followed by quote
            $query->where('body', 'LIKE', '%\\\\"%');
        }

        if ($limit) {
            $query->limit($limit);
        }

        $posts = $query->get();

        if ($posts->isEmpty()) {
            $this->info('No posts with broken links found.');

            return self::SUCCESS;
        }

        $this->info("Found {$posts->count()} posts with potential broken links.");
        $this->newLine();

        $fixed = 0;
        $bar = $this->output->createProgressBar($posts->count());
        $bar->start();

        foreach ($posts as $post) {
            $originalBody = $post->body;

            // Fix escaped quotes: \" -> "
            $fixedBody = str_replace('\\"', '"', $originalBody);

            // Also fix escaped single quotes if present: \' -> '
            $fixedBody = str_replace("\\'", "'", $fixedBody);

            // Check if anything changed
            if ($fixedBody !== $originalBody) {
                if ($dryRun) {
                    $this->newLine();
                    $this->showDiff($post, $originalBody, $fixedBody);
                } else {
                    $post->update(['body' => $fixedBody]);
                }
                $fixed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if ($dryRun) {
            $this->info("Would fix {$fixed} posts.");
            $this->info('Run without --dry-run to apply changes.');
        } else {
            $this->info("Successfully fixed {$fixed} posts.");
        }

        return self::SUCCESS;
    }

    /**
     * Show a diff preview for dry-run mode.
     */
    private function showDiff(Post $post, string $original, string $fixed): void
    {
        $this->line("Post ID: {$post->id}");
        $this->line("Title: {$post->title}");
        $this->line('---');

        // Find and show the first few differences
        preg_match_all('/href=\\\\"([^\\\\]+)\\\\"/', $original, $brokenMatches);

        if (! empty($brokenMatches[0])) {
            $this->warn('Broken links found:');
            foreach (array_slice($brokenMatches[0], 0, 3) as $match) {
                $this->line("  - {$match}");
            }

            if (count($brokenMatches[0]) > 3) {
                $this->line('  ... and '.(count($brokenMatches[0]) - 3).' more');
            }
        }

        // Show what they will become
        preg_match_all('/href="(https?:\/\/[^"]+)"/', $fixed, $fixedMatches);

        if (! empty($fixedMatches[0])) {
            $this->info('After fix:');
            foreach (array_slice($fixedMatches[0], 0, 3) as $match) {
                $this->line("  - {$match}");
            }
        }

        $this->newLine();
    }
}
