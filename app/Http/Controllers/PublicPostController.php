<?php

namespace App\Http\Controllers;

use App\Enums\BannerPosition;
use App\Enums\PostStatus;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Post;
use App\Services\UnsplashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController extends Controller
{
    public function __construct(private UnsplashService $unsplashService) {}

    public function index(Request $request): Response
    {
        $featuredPosts = Cache::remember('home_featured_posts', 300, function () {
            return Post::query()
                ->published()
                ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
                ->latest('published_at')
                ->take(5)
                ->get()
                ->map(fn (Post $post) => $this->formatPostCard($post));
        });

        $page = request()->get('page', 1);
        $latestPosts = Cache::remember("home_latest_posts_page_{$page}", 300, function () {
            return Post::query()
                ->published()
                ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
                ->latest('published_at')
                ->skip(5)
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Post $post) => $this->formatPostCard($post));
        });

        $trendingPosts = Cache::remember('home_trending_posts', 300, function () {
            return Post::query()
                ->published()
                ->with(['category:id,name,slug'])
                ->orderByDesc('view_count')
                ->take(5)
                ->get()
                ->map(fn (Post $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'category' => $post->category ? [
                        'name' => $post->category->name,
                        'slug' => $post->category->slug,
                    ] : null,
                    'view_count' => $post->view_count,
                ]);
        });

        $categories = Cache::remember('home_categories_with_count', 300, function () {
            return Category::query()
                ->withCount(['posts' => fn ($q) => $q->where('status', PostStatus::Published)])
                ->whereHas('posts', fn ($q) => $q->where('status', PostStatus::Published))
                ->orderBy('name')
                ->get();
        });

        // Top 3 categories with 5 latest posts each (for category sections)
        $categoryPosts = Cache::remember('home_category_posts', 300, function () {
            $topCategories = Category::query()
                ->withCount(['posts' => fn ($q) => $q->where('status', PostStatus::Published)])
                ->whereHas('posts', fn ($q) => $q->where('status', PostStatus::Published))
                ->orderByDesc('posts_count')
                ->take(3)
                ->get();

            $categoryIds = $topCategories->pluck('id');
            $postsByCategory = Post::query()
                ->published()
                ->whereIn('category_id', $categoryIds)
                ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
                ->latest('published_at')
                ->get()
                ->groupBy('category_id');

            return $topCategories->map(function (Category $category) use ($postsByCategory) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'posts' => $postsByCategory->get($category->id, collect())
                        ->take(5)
                        ->map(fn (Post $post) => $this->formatPostCard($post)),
                ];
            });
        });

        $marketPosts = Cache::remember('home_market_posts', 300, function () {
            return Post::query()
                ->published()
                ->whereHas('category', fn ($q) => $q->where('slug', 'market'))
                ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
                ->latest('published_at')
                ->take(4)
                ->get()
                ->map(fn (Post $post) => $this->formatPostCard($post));
        });

        $popularMarketPosts = Cache::remember('home_popular_market_posts', 300, function () {
            return Post::query()
                ->published()
                ->whereHas('category', fn ($q) => $q->where('slug', 'market'))
                ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
                ->orderByDesc('view_count')
                ->latest('published_at')
                ->take(4)
                ->get()
                ->map(fn (Post $post) => $this->formatPostCard($post));
        });

        return Inertia::render('public/home', [
            'featuredPosts' => $featuredPosts,
            'latestPosts' => $latestPosts,
            'trendingPosts' => $trendingPosts,
            'categories' => $categories,
            'categoryPosts' => $categoryPosts,
            'marketPosts' => $marketPosts,
            'popularMarketPosts' => $popularMarketPosts,
            'belowNavbarBanners' => Banner::forSlot(BannerPosition::HomeBelowNavbar),
            'heroBelowBanners' => Banner::forSlot(BannerPosition::HomeHeroBelow),
            'sidebarBanners' => Banner::forSlot(BannerPosition::HomeSidebar),
            'feedInlineBanners' => Banner::forSlot(BannerPosition::HomeFeedInline),
            'homeMidBanners' => Banner::forSlot(BannerPosition::HomeMidSection),
            'homeLeftBanners' => Banner::forSlot(BannerPosition::HomeLeftSkin),
            'homeRightBanners' => Banner::forSlot(BannerPosition::HomeRightSkin),
            'popupBanners' => Banner::forSlot(BannerPosition::GlobalPopup),
        ]);
    }

    public function show(Request $request, Post $post): Response
    {
        if ($post->status !== PostStatus::Published) {
            abort(404);
        }

        $this->trackView($request, $post);

        $post->load(['user:id,name,profile_photo,bio', 'category:id,name,slug', 'tags:id,name,slug']);

        $relatedPosts = Post::query()
            ->published()
            ->where('category_id', $post->category_id)
            ->where('id', '!=', $post->id)
            ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
            ->latest('published_at')
            ->take(4)
            ->get()
            ->map(fn (Post $relatedPost) => $this->formatPostCard($relatedPost));

        $trendingPosts = Post::query()
            ->published()
            ->with(['category:id,name,slug'])
            ->orderByDesc('view_count')
            ->take(5)
            ->get()
            ->map(fn (Post $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'view_count' => $p->view_count,
                'category' => $p->category ? [
                    'name' => $p->category->name,
                    'slug' => $p->category->slug,
                ] : null,
            ]);

        $popularPosts = Post::query()
            ->published()
            ->with(['user:id,name,profile_photo,bio', 'category:id,name,slug'])
            ->where('id', '!=', $post->id)
            ->orderByDesc('view_count')
            ->take(4)
            ->get()
            ->map(fn (Post $p) => $this->formatPostCard($p));

        $user = $request->user();

        $comments = $post->comments()
            ->with('user:id,name,profile_photo,bio')
            ->latest()
            ->get()
            ->map(fn ($comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'created_at_human' => $comment->created_at->diffForHumans(),
                'user' => $comment->user ? [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                ] : null,
                'guest_name' => $comment->guest_name,
                'commenter_name' => $comment->commenter_name,
            ]);

        return Inertia::render('public/post-show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'featured_image' => $this->resolvePostImage($post),
                'meta_title' => $post->meta_title ?: $post->title,
                'meta_description' => $post->meta_description ?: $post->excerpt,
                'og_image' => ($post->og_image ?: $this->resolvePostImage($post)),
                'view_count' => $post->view_count,
                'likes_count' => $post->likes()->count(),
                'is_liked' => in_array($post->id, $request->session()->get('liked_posts', [])),
                'comments_count' => $post->comments()->count(),
                'published_at' => $post->published_at?->toISOString(),
                'published_at_human' => $post->published_at?->diffForHumans(),
                'published_at_formatted' => $post->published_at?->format('d M Y, H:i'),
                'author' => [
                    'name' => $post->user->name,
                    'bio' => $post->user->bio,
                    'profile_photo' => $post->user->profile_photo ? Storage::disk('public')->url($post->user->profile_photo) : null,
                ],
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
                'tags' => $post->tags->map(fn ($tag) => [
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ]),
            ],
            'comments' => $comments,
            'relatedPosts' => $relatedPosts,
            'trendingPosts' => $trendingPosts,
            'popularPosts' => $popularPosts,
            'topBanners' => Banner::forSlot(BannerPosition::ArticleTop),
            'bottomBanners' => Banner::forSlot(BannerPosition::ArticleBottom),
            'sidebarBanners' => Banner::forSlot(BannerPosition::HomeSidebar),
        ]);
    }

    /**
     * Track a view for the post, rate-limited by session.
     */
    private function trackView(Request $request, Post $post): void
    {
        $sessionKey = "post_viewed_{$post->id}";

        if (! $request->session()->has($sessionKey)) {
            $post->increment('view_count');
            $request->session()->put($sessionKey, now()->timestamp);
        } else {
            $lastViewed = $request->session()->get($sessionKey);
            // Allow re-count after 1 hour
            if (now()->timestamp - $lastViewed > 3600) {
                $post->increment('view_count');
                $request->session()->put($sessionKey, now()->timestamp);
            }
        }
    }

    private function resolvePostImage(Post $post): ?string
    {
        // 1. Use manual featured image if set (stored as relative path)
        if (! empty($post->featured_image)) {
            // Already a full URL (e.g. Unsplash or previously resolved)
            if (str_starts_with($post->featured_image, 'http')) {
                return $post->featured_image;
            }

            return Storage::disk('public')->url($post->featured_image);
        }

        // 2. Use persisted Unsplash URL if set
        if (! empty($post->unsplash_image_url)) {
            return $post->unsplash_image_url;
        }

        // Images are fetched by PostObserver on creation
        // or via: php artisan posts:fetch-unsplash-images
        return null;
    }

    private function formatPostCard(Post $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'featured_image' => $this->resolvePostImage($post),
            'view_count' => $post->view_count,
            'published_at' => $post->published_at?->toISOString(),
            'published_at_human' => $post->published_at?->diffForHumans(),
            'author' => [
                'name' => $post->user->name,
                'bio' => $post->user->bio,
                'profile_photo' => $post->user->profile_photo ? Storage::disk('public')->url($post->user->profile_photo) : null,
            ],
            'category' => $post->category ? [
                'name' => $post->category->name,
                'slug' => $post->category->slug,
            ] : null,
        ];
    }
}
