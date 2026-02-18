<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AssignPostCategories extends Command
{
    protected $signature = 'posts:assign-categories
                            {--dry-run : Show what would be assigned without making changes}
                            {--default= : Default category ID for unmatched posts}';

    protected $description = 'Auto-assign categories to posts based on keyword matching in title and content';

    /**
     * Keyword mappings for each category.
     * Order matters - first match wins.
     *
     * @var array<string, array<string>>
     */
    protected array $categoryKeywords = [
        // Bisnis - usaha, perusahaan, industri (PRIORITAS TINGGI - banyak artikel bisnis)
        'Bisnis' => [
            'bisnis', 'business', 'usaha', 'umkm', 'ukm', 'perusahaan',
            'industri', 'manufaktur', 'produksi', 'distribusi', 'retail',
            'franchise', 'waralaba', 'entrepreneur', 'wirausaha', 'ceo',
            'direktur', 'manajemen', 'marketing', 'pemasaran', 'penjualan',
            'studi kelayakan', 'kelayakan bisnis', 'konsultan', 'konsultasi',
            'business plan', 'rencana bisnis', 'proposal bisnis', 'proyek',
            'tender', 'kontrak', 'kerjasama', 'partnership', 'merger',
            'akuisisi', 'ekspansi', 'cabang', 'properti', 'real estate',
            'developer', 'kontraktor', 'grapadi', 'jasa studi', 'jasa konsultan',
            'jasa pembuatan', 'jasa sebar', 'affiliasi', 'affiliate',
        ],

        // Insight - analisis, riset, laporan
        'Insight' => [
            'analisis mendalam', 'analisa pasar', 'riset pasar', 'research',
            'survei', 'survey', 'kuesioner', 'statistik', 'laporan khusus',
            'kajian', 'evaluasi', 'assessment', 'benchmark', 'forecast',
            'outlook', 'dampak ekonomi',
        ],

        // Market - saham, investasi, pasar modal
        'Market' => [
            'saham', 'ihsg', 'bursa efek', 'idx', 'emiten', 'investor saham',
            'pasar modal', 'trading saham', 'dividen', 'ipo', 'obligasi',
            'reksadana', 'portofolio investasi', 'kapitalisasi pasar',
            'bullish', 'bearish', 'stock market',
        ],

        // Finansial - perbankan, keuangan
        'Finansial' => [
            'perbankan', 'kredit bank', 'pinjaman', 'suku bunga', 'inflasi',
            'nilai tukar', 'kurs rupiah', 'bi rate', 'ojk', 'asuransi',
            'pajak penghasilan', 'keuangan pribadi', 'finansial', 'financial planning',
            'gdp', 'pdb', 'fiskal', 'moneter', 'defisit', 'surplus anggaran',
        ],

        // Tech - teknologi, gadget, digital
        'Tech' => [
            'teknologi', 'software', 'aplikasi mobile', 'smartphone', 'iphone',
            'samsung galaxy', 'android', 'ios', 'gadget', 'ai', 'kecerdasan buatan',
            'artificial intelligence', 'startup teknologi', 'fintech',
            'e-commerce', 'ecommerce', 'komputer', 'laptop', 'kamera hp',
            'robot', 'metaverse', 'blockchain', 'crypto', 'bitcoin', 'coding',
            'programming', 'developer', 'machine learning',
        ],

        // Lifestyle - gaya hidup, travel, kuliner
        'Lifestyle' => [
            'lifestyle', 'gaya hidup', 'travel', 'wisata', 'liburan', 'hotel',
            'kuliner', 'makanan', 'restoran', 'cafe', 'kopi', 'fashion',
            'beauty', 'kecantikan', 'skincare', 'makeup', 'kesehatan', 'health',
            'fitness', 'olahraga', 'gym', 'diet', 'mental health', 'wellness',
            'hobby', 'hobi', 'musik', 'film', 'buku', 'seni', 'art',
            'rumah tangga', 'dekorasi', 'interior', 'keluarga', 'family',
            'parenting', 'pasangan', 'jodoh', 'cinta', 'relationship',
            'cowok', 'cewek', 'gen z', 'milenial', 'cemilan', 'snack',
            'pohon', 'tanaman', 'berkebun', 'wawancara kerja', 'karir',
        ],

        // Opini - pendapat, kolom, editorial
        'Opini' => [
            'opini', 'pendapat saya', 'kolom', 'editorial', 'sudut pandang',
            'perspektif', 'menurut saya', 'saya pikir', 'refleksi',
            'renungan', 'hikmah', 'inspirasi hidup', 'keutamaan', 'sholawat',
        ],
    ];

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $defaultCategoryId = $this->option('default');

        $this->info('Starting category assignment...');

        // Load categories
        $categories = Category::pluck('id', 'name');

        if ($categories->isEmpty()) {
            $this->error('No categories found. Please create categories first.');

            return self::FAILURE;
        }

        $this->info('Categories loaded: '.implode(', ', $categories->keys()->toArray()));

        // Get posts without categories
        $posts = Post::whereNull('category_id')->get();
        $totalPosts = $posts->count();

        if ($totalPosts === 0) {
            $this->info('All posts already have categories assigned.');

            return self::SUCCESS;
        }

        $this->info("Found {$totalPosts} posts without categories");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $assignments = [];
        $unmatched = [];

        $bar = $this->output->createProgressBar($totalPosts);
        $bar->start();

        foreach ($posts as $post) {
            $matchedCategory = $this->matchCategory($post, $categories);

            if ($matchedCategory) {
                $assignments[$matchedCategory] = ($assignments[$matchedCategory] ?? 0) + 1;

                if (! $dryRun) {
                    $post->update(['category_id' => $categories[$matchedCategory]]);
                }
            } else {
                $unmatched[] = $post;

                // Assign to default category if specified
                if ($defaultCategoryId && ! $dryRun) {
                    $post->update(['category_id' => $defaultCategoryId]);
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('Assignment Summary:');
        $this->table(
            ['Category', 'Posts Assigned'],
            collect($assignments)->map(fn ($count, $cat) => [$cat, $count])->values()->toArray()
        );

        if (count($unmatched) > 0) {
            $this->warn('Unmatched posts: '.count($unmatched));

            if ($defaultCategoryId) {
                $defaultCat = Category::find($defaultCategoryId);
                $this->info("Assigned to default category: {$defaultCat->name}");
            } else {
                $this->line('Sample unmatched titles:');
                foreach (array_slice($unmatched, 0, 10) as $post) {
                    $this->line('  - '.Str::limit($post->title, 70));
                }

                if (count($unmatched) > 10) {
                    $this->line('  ... and '.(count($unmatched) - 10).' more');
                }
            }
        }

        if ($dryRun) {
            $this->newLine();
            $this->warn('This was a dry run. Run without --dry-run to apply changes.');
        }

        return self::SUCCESS;
    }

    /**
     * Match a post to a category based on keywords.
     */
    protected function matchCategory(Post $post, $categories): ?string
    {
        $searchText = Str::lower($post->title.' '.$post->body.' '.$post->excerpt);

        foreach ($this->categoryKeywords as $categoryName => $keywords) {
            if (! $categories->has($categoryName)) {
                continue;
            }

            foreach ($keywords as $keyword) {
                if (Str::contains($searchText, Str::lower($keyword))) {
                    return $categoryName;
                }
            }
        }

        return null;
    }
}
