<?php

namespace App\Http\Controllers;

use App\Enums\BannerPosition;
use App\Enums\PostStatus;
use App\Models\Banner;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicTagController extends Controller
{
    public function show(Request $request, Tag $tag): Response
    {
        $posts = $tag->posts()
            ->published()
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

        $popularTags = Tag::query()
            ->withCount(['posts' => fn ($q) => $q->where('status', PostStatus::Published)])
            ->whereHas('posts', fn ($q) => $q->where('status', PostStatus::Published))
            ->orderByDesc('posts_count')
            ->limit(20)
            ->get();

        return Inertia::render('public/tag-show', [
            'tag' => $tag,
            'posts' => $posts,
            'popularTags' => $popularTags,
            'topBanners' => Banner::forSlot(BannerPosition::CategoryTop),
            'sidebarBanners' => Banner::forSlot(BannerPosition::CategorySidebar),
        ]);
    }

    private function resolvePostImage(Post $post): ?string
    {
        if (! empty($post->featured_image)) {
            if (str_starts_with($post->featured_image, 'http')) {
                return $post->featured_image;
            }

            return \Illuminate\Support\Facades\Storage::disk('public')->url($post->featured_image);
        }

        if (! empty($post->unsplash_image_url)) {
            return $post->unsplash_image_url;
        }

        return null;
    }
}
