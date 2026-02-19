<?php

namespace App\Http\Controllers;

use App\Enums\PostStatus;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen(trim($query)) < 2) {
            return response()->json([]);
        }

        $posts = Post::query()
            ->where('status', PostStatus::Published)
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                    ->orWhere('excerpt', 'LIKE', "%{$query}%");
            })
            ->with(['user:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->take(8)
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'featured_image' => $this->resolveImage($post),
                'published_at_human' => $post->published_at?->diffForHumans(),
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
            ]);

        return response()->json($posts);
    }

    private function resolveImage(Post $post): ?string
    {
        $image = $post->featured_image ?? $post->unsplash_image_url ?? null;
        if (! $image) return null;
        if (str_starts_with($image, 'http')) return $image;
        return Storage::disk('public')->url($image);
    }
}
