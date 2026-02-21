<?php

namespace App\Http\Controllers;

use App\Enums\BannerPosition;
use App\Enums\PostStatus;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Post;
use App\Services\UnsplashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController extends Controller
{
    public function __construct(private UnsplashService $unsplashService) {}

    public function index(Request $request): Response
    {
        $featuredPosts = Post::query()
            ->published()
            ->with(['user:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->take(5)
            ->get()
            ->map(fn (Post $post) => $this->formatPostCard($post));

        $latestPosts = Post::query()
            ->published()
            ->with(['user:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->skip(5)
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Post $post) => $this->formatPostCard($post));

        $trendingPosts = Post::query()
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

        $categories = Category::query()
            ->withCount(['posts' => fn ($q) => $q->where('status', PostStatus::Published)])
            ->whereHas('posts', fn ($q) => $q->where('status', PostStatus::Published))
            ->orderBy('name')
            ->get();

        // Top 3 categories with 5 latest posts each (for category sections)
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
            ->with(['user:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->get()
            ->groupBy('category_id');

        $categoryPosts = $topCategories->map(function (Category $category) use ($postsByCategory) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'posts' => $postsByCategory->get($category->id, collect())
                    ->take(5)
                    ->map(fn (Post $post) => $this->formatPostCard($post)),
            ];
        });

        return Inertia::render('public/home', [
            'featuredPosts' => $featuredPosts,
            'latestPosts' => $latestPosts,
            'trendingPosts' => $trendingPosts,
            'categories' => $categories,
            'categoryPosts' => $categoryPosts,
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

        $post->load(['user:id,name', 'category:id,name,slug', 'tags:id,name,slug']);

        $relatedPosts = Post::query()
            ->published()
            ->where('category_id', $post->category_id)
            ->where('id', '!=', $post->id)
            ->with(['user:id,name', 'category:id,name,slug'])
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
            ->with(['user:id,name', 'category:id,name,slug'])
            ->where('id', '!=', $post->id)
            ->orderByDesc('view_count')
            ->take(4)
            ->get()
            ->map(fn (Post $p) => $this->formatPostCard($p));

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
                'published_at' => $post->published_at?->toISOString(),
                'published_at_human' => $post->published_at?->diffForHumans(),
                'published_at_formatted' => $post->published_at?->format('d M Y, H:i'),
                'author' => [
                    'name' => $post->user->name,
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
            ],
            'category' => $post->category ? [
                'name' => $post->category->name,
                'slug' => $post->category->slug,
            ] : null,
        ];
    }
}
