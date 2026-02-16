<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Models\Setting;
use App\Services\ViewPointCalculationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CalculateViewPoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'points:calculate-views';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate and award points for post views based on current settings.';

    /**
     * Execute the console command.
     */
    public function handle(ViewPointCalculationService $service): void
    {
        $this->info('Starting view point calculation...');

        $maxPoints = (int) Setting::get('max_points_per_article', 10);
        $viewsPerPoint = (int) Setting::get('views_per_point', 100);

        if ($viewsPerPoint <= 0) {
            $this->warn('Views per point setting is 0 or invalid. Exiting.');

            return;
        }

        $this->info("Settings: Max {$maxPoints} points per article, 1 point per {$viewsPerPoint} views.");

        // Fetch published posts that have NOT reached the point cap
        // We use chunkById for memory efficiency with large datasets
        $query = Post::published()
            ->where('points_awarded_from_views', '<', $maxPoints);

        $total = $query->count();
        $this->info("Found {$total} eligible posts (not yet capped).");

        if ($total === 0) {
            $this->info('No posts to process.');

            return;
        }

        $bar = $this->output->createProgressBar($total);

        $query->chunkById(100, function ($posts) use ($service, $bar) {
            foreach ($posts as $post) {
                try {
                    $service->processPost($post);
                } catch (\Exception $e) {
                    Log::error("Failed to process view points for post ID {$post->id}: ".$e->getMessage());
                    $this->error("Error processing post {$post->id}");
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('View point calculation complete.');
    }
}
