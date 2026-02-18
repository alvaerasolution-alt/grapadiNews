<?php

namespace App\Console\Commands;

use App\Enums\PostStatus;
use App\Models\Post;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ImportWordPressData extends Command
{
    protected $signature = 'import:wordpress
                            {sql-file : Path to the WordPress SQL dump file}
                            {--dry-run : Run without actually importing data}
                            {--limit= : Limit number of posts to import}
                            {--user-id= : Laravel user ID to assign posts to (creates placeholder if not provided)}';

    protected $description = 'Import posts from WordPress SQL dump into Laravel (text content only, no images)';

    /**
     * @var array<int, array{id: int, author: int, title: string, slug: string, excerpt: string, content: string, status: string, date: string, modified: string}>
     */
    private array $wpPosts = [];

    /**
     * @var array<int, int>
     */
    private array $wpViewCounts = [];

    /**
     * @var array<int, int>
     */
    private array $wpPointTotals = [];

    /**
     * @var array<int, int>
     */
    private array $wpIdToLaravelId = [];

    public function handle(): int
    {
        $sqlFile = $this->argument('sql-file');
        $dryRun = $this->option('dry-run');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        if (! file_exists($sqlFile)) {
            $this->error("SQL file not found: {$sqlFile}");

            return self::FAILURE;
        }

        $this->info('Starting WordPress import...');
        $this->newLine();

        // Step 1: Parse SQL file
        $this->info('Step 1: Parsing SQL dump file...');
        $this->parseSqlFile($sqlFile);
        $this->info("  Found {$this->countPosts()} posts");
        $this->info('  Found '.count($this->wpViewCounts).' view count records');
        $this->info('  Found '.count($this->wpPointTotals).' point total records');
        $this->newLine();

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be imported');
            $this->showSampleData();

            return self::SUCCESS;
        }

        // Step 2: Get or create user
        $this->info('Step 2: Setting up user...');
        $user = $this->getOrCreateUser();
        $this->info("  Using user: {$user->name} (ID: {$user->id})");
        $this->newLine();

        // Step 3: Import posts
        $this->info('Step 3: Importing posts...');
        $imported = $this->importPosts($user, $limit);
        $this->info("  Imported {$imported} posts");
        $this->newLine();

        // Step 4: Update view counts
        $this->info('Step 4: Updating view counts...');
        $updated = $this->updateViewCounts();
        $this->info("  Updated {$updated} posts with view counts");
        $this->newLine();

        // Step 5: Update point totals
        $this->info('Step 5: Updating point totals...');
        $points = $this->updatePointTotals();
        $this->info("  Updated {$points} posts with point totals");
        $this->newLine();

        $this->info('Import completed successfully!');

        return self::SUCCESS;
    }

    private function parseSqlFile(string $filePath): void
    {
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            return;
        }

        $currentTable = '';
        $buffer = '';

        while (($line = fgets($handle)) !== false) {
            // Detect which table we're inserting into
            if (preg_match('/INSERT INTO `(gra_\w+)`/', $line, $matches)) {
                $currentTable = $matches[1];
            }

            // Accumulate lines for multi-line INSERT statements
            $buffer .= $line;

            // Process when we hit the end of an INSERT statement
            if (str_contains($line, ';') && str_contains($buffer, 'INSERT INTO')) {
                $this->parseInsertStatement($currentTable, $buffer);
                $buffer = '';
            }
        }

        fclose($handle);
    }

    private function parseInsertStatement(string $table, string $sql): void
    {
        match ($table) {
            'gra_posts' => $this->parsePostsInsert($sql),
            'gra_popularpostsdata' => $this->parseViewCountsInsert($sql),
            'gra_point_total' => $this->parsePointTotalsInsert($sql),
            default => null,
        };
    }

    private function parsePostsInsert(string $sql): void
    {
        // Match individual value tuples from INSERT statement
        // Format: (ID, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, ...)
        preg_match_all('/\((\d+),\s*(\d+),\s*\'([^\']*)\',\s*\'([^\']*)\',\s*\'((?:[^\']|\'\')*)\',\s*\'((?:[^\']|\'\')*)\',\s*\'((?:[^\']|\'\')*)\',\s*\'([^\']*)\',\s*\'[^\']*\',\s*\'[^\']*\',\s*\'[^\']*\',\s*\'([^\']*)\',\s*\'[^\']*\',\s*\'[^\']*\',\s*\'([^\']*)\',\s*\'[^\']*\',\s*\'[^\']*\',\s*\d+,\s*\'[^\']*\',\s*\d+,\s*\'([^\']*)\'/s', $sql, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $postType = $match[11] ?? '';

            // Only import actual posts (not pages, attachments, etc.)
            if ($postType !== 'post') {
                continue;
            }

            $id = (int) $match[1];
            $this->wpPosts[$id] = [
                'id' => $id,
                'author' => (int) $match[2],
                'date' => $match[3],
                'content' => $this->unescapeSql($match[5]),
                'title' => $this->unescapeSql($match[6]),
                'excerpt' => $this->unescapeSql($match[7]),
                'status' => $match[8],
                'slug' => $match[9],
                'modified' => $match[10],
            ];
        }
    }

    private function parseViewCountsInsert(string $sql): void
    {
        // Format: (postid, day, last_viewed, pageviews)
        preg_match_all('/\((\d+),\s*\'[^\']*\',\s*\'[^\']*\',\s*(\d+)\)/', $sql, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $postId = (int) $match[1];
            $views = (int) $match[2];

            // Sum up views per post (there may be multiple records)
            $this->wpViewCounts[$postId] = ($this->wpViewCounts[$postId] ?? 0) + $views;
        }
    }

    private function parsePointTotalsInsert(string $sql): void
    {
        // Format: (post_id, total)
        preg_match_all('/\((\d+),\s*(-?\d+)\)/', $sql, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $this->wpPointTotals[(int) $match[1]] = (int) $match[2];
        }
    }

    private function unescapeSql(string $value): string
    {
        // Unescape SQL string
        $value = str_replace("''", "'", $value);
        $value = str_replace("\\'", "'", $value);
        $value = str_replace('\\"', '"', $value); // Fix escaped double quotes
        $value = str_replace('\\r\\n', "\n", $value);
        $value = str_replace('\\n', "\n", $value);
        $value = str_replace('\\r', "\n", $value);

        return $value;
    }

    private function countPosts(): int
    {
        return count($this->wpPosts);
    }

    private function getOrCreateUser(): User
    {
        $userId = $this->option('user-id');

        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                return $user;
            }
            $this->warn("User ID {$userId} not found, creating placeholder...");
        }

        // Create or get placeholder user for imported posts
        $user = User::firstOrCreate(
            ['email' => 'wordpress-import@grapadinews.local'],
            [
                'name' => 'WordPress Import',
                'password' => Hash::make(Str::random(32)),
            ]
        );

        // Assign contributor role if it exists
        if (! $user->hasRole('contributor')) {
            try {
                $user->assignRole('contributor');
            } catch (\Exception $e) {
                // Role may not exist yet
            }
        }

        return $user;
    }

    private function importPosts(User $user, ?int $limit): int
    {
        $posts = $this->wpPosts;

        if ($limit) {
            $posts = array_slice($posts, 0, $limit, true);
        }

        $imported = 0;
        $bar = $this->output->createProgressBar(count($posts));
        $bar->start();

        foreach ($posts as $wpPost) {
            try {
                $cleanedBody = $this->cleanWordPressContent($wpPost['content']);
                $slug = $this->generateUniqueSlug($wpPost['slug'], $wpPost['title']);
                $status = $this->mapStatus($wpPost['status']);

                $post = Post::create([
                    'user_id' => $user->id,
                    'category_id' => null, // Will be assigned later
                    'title' => $wpPost['title'],
                    'slug' => $slug,
                    'excerpt' => $wpPost['excerpt'] ?: $this->generateExcerpt($cleanedBody),
                    'body' => $cleanedBody,
                    'featured_image' => null, // Skipping images
                    'status' => $status,
                    'meta_title' => null,
                    'meta_description' => null,
                    'og_image' => null,
                    'view_count' => 0,
                    'points_awarded_on_publish' => 0,
                    'points_awarded_from_views' => 0,
                    'published_at' => $status === PostStatus::Published ? $wpPost['date'] : null,
                    'created_at' => $wpPost['date'],
                    'updated_at' => $wpPost['modified'],
                ]);

                // Store mapping for view counts and points
                $this->wpIdToLaravelId[$wpPost['id']] = $post->id;
                $imported++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->warn("Failed to import post ID {$wpPost['id']}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return $imported;
    }

    private function cleanWordPressContent(string $content): string
    {
        // Remove WordPress shortcodes like [caption]...[/caption]
        $content = preg_replace('/\[caption[^\]]*\](.*?)\[\/caption\]/s', '$1', $content);

        // Remove other common shortcodes
        $content = preg_replace('/\[\/?(?:et_pb_|vc_|gallery|audio|video|embed)[^\]]*\]/s', '', $content);

        // Remove remaining shortcodes
        $content = preg_replace('/\[[^\]]+\]/', '', $content);

        // Remove img tags (skipping images)
        $content = preg_replace('/<img[^>]*>/i', '', $content);

        // Remove inline styles
        $content = preg_replace('/\s*style\s*=\s*"[^"]*"/i', '', $content);
        $content = preg_replace('/\s*style\s*=\s*\'[^\']*\'/i', '', $content);

        // Remove class attributes with WordPress-specific classes
        $content = preg_replace('/\s*class\s*=\s*"[^"]*wp-[^"]*"/i', '', $content);

        // Remove data attributes
        $content = preg_replace('/\s*data-[a-z-]+\s*=\s*"[^"]*"/i', '', $content);

        // Remove empty paragraphs and divs
        $content = preg_replace('/<p[^>]*>\s*<\/p>/i', '', $content);
        $content = preg_replace('/<div[^>]*>\s*<\/div>/i', '', $content);

        // Remove span tags but keep content
        $content = preg_replace('/<\/?span[^>]*>/i', '', $content);

        // Clean up whitespace
        $content = preg_replace('/\n{3,}/', "\n\n", $content);
        $content = trim($content);

        return $content;
    }

    private function generateUniqueSlug(string $slug, string $title): string
    {
        $slug = $slug ?: Str::slug($title);

        // Check for duplicates
        $originalSlug = $slug;
        $counter = 1;

        while (Post::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function mapStatus(string $wpStatus): PostStatus
    {
        return match ($wpStatus) {
            'publish' => PostStatus::Published,
            'draft' => PostStatus::Draft,
            'pending' => PostStatus::Pending,
            'private' => PostStatus::Draft,
            'trash' => PostStatus::Rejected,
            default => PostStatus::Draft,
        };
    }

    private function generateExcerpt(string $body, int $length = 200): string
    {
        $text = strip_tags($body);
        $text = preg_replace('/\s+/', ' ', $text);

        if (strlen($text) <= $length) {
            return $text;
        }

        return Str::limit($text, $length);
    }

    private function updateViewCounts(): int
    {
        $updated = 0;

        foreach ($this->wpViewCounts as $wpId => $views) {
            if (isset($this->wpIdToLaravelId[$wpId])) {
                Post::where('id', $this->wpIdToLaravelId[$wpId])
                    ->update(['view_count' => $views]);
                $updated++;
            }
        }

        return $updated;
    }

    private function updatePointTotals(): int
    {
        $updated = 0;

        foreach ($this->wpPointTotals as $wpId => $points) {
            if (isset($this->wpIdToLaravelId[$wpId])) {
                // Only store positive points
                Post::where('id', $this->wpIdToLaravelId[$wpId])
                    ->update(['points_awarded_from_views' => max(0, $points)]);
                $updated++;
            }
        }

        return $updated;
    }

    private function showSampleData(): void
    {
        $this->newLine();
        $this->info('Sample posts found:');
        $this->newLine();

        $sample = array_slice($this->wpPosts, 0, 3, true);

        foreach ($sample as $post) {
            $this->line("ID: {$post['id']}");
            $this->line("Title: {$post['title']}");
            $this->line("Slug: {$post['slug']}");
            $this->line("Status: {$post['status']}");
            $this->line('Content preview: '.Str::limit(strip_tags($post['content']), 100));
            $this->newLine();
        }
    }
}
