<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PostStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePostStatusRequest;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPostController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Post::query()
            ->with(['user:id,name', 'category:id,name,slug']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        $posts = $query->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['status', 'category', 'search']),
            'statuses' => array_column(PostStatus::cases(), 'value'),
        ]);
    }

    public function show(Post $post): Response
    {
        $post->load(['user:id,name,email', 'category:id,name,slug', 'tags:id,name']);

        // Resolve featured_image to a full URL (stored as a relative path)
        $featuredImage = null;
        if (! empty($post->featured_image)) {
            $featuredImage = str_starts_with($post->featured_image, 'http')
                ? $post->featured_image
                : \Illuminate\Support\Facades\Storage::disk('public')->url($post->featured_image);
        } elseif (! empty($post->unsplash_image_url)) {
            $featuredImage = $post->unsplash_image_url;
        }

        return Inertia::render('admin/posts/show', [
            'post' => array_merge($post->toArray(), [
                'featured_image' => $featuredImage,
            ]),
        ]);
    }

    public function updateStatus(UpdatePostStatusRequest $request, Post $post): RedirectResponse
    {
        $status = $request->validated()['status'];

        $post->update([
            'status' => $status,
            'published_at' => $status === PostStatus::Published->value && ! $post->published_at
                ? now()
                : $post->published_at,
        ]);

        return redirect()->back()
            ->with('success', "Post status updated to {$status}.");
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post deleted successfully.');
    }
}
