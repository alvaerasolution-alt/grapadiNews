<?php

namespace App\Http\Controllers;

use App\Enums\BannerPosition;
use App\Enums\PostStatus;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Post;
use App\Services\UnsplashService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicCategoryController extends Controller
{
    public function __construct(private UnsplashService $unsplashService) {}

    public function show(Request $request, Category $category): Response
    {
        $posts = Post::query()
            ->published()
            ->where('category_id', $category->id)
            ->with(['user:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'featured_image' => $this->resolvePostImage($post),
                'view_count' => $post->view_count,
                'published_at' => $post->published_at?->toISOString(),
                'published_at_human' => $post->published_at?->diffForHumans(),
                'author' => ['name' => $post->user->name],
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
            ]);

        $categories = Category::query()
            ->withCount(['posts' => fn ($q) => $q->where('status', PostStatus::Published)])
            ->whereHas('posts', fn ($q) => $q->where('status', PostStatus::Published))
            ->orderBy('name')
            ->get();

        return Inertia::render('public/category-show', [
            'category' => $category,
            'posts' => $posts,
            'categories' => $categories,
            'topBanners' => Banner::forSlot(BannerPosition::CategoryTop),
            'sidebarBanners' => Banner::forSlot(BannerPosition::CategorySidebar),
        ]);
    }

    private function resolvePostImage(Post $post): ?string
    {
        // 1. Use manual featured image if set (stored as relative path)
        if (! empty($post->featured_image)) {
            if (str_starts_with($post->featured_image, 'http')) {
                return $post->featured_image;
            }
            return \Illuminate\Support\Facades\Storage::disk('public')->url($post->featured_image);
        }

        // 2. Use persisted Unsplash URL if set
        if (! empty($post->unsplash_image_url)) {
            return $post->unsplash_image_url;
        }

        return null;
    }
}
