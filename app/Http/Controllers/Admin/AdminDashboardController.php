<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_posts' => Post::count(),
                'published_posts' => Post::published()->count(),
                'pending_posts' => Post::pending()->count(),
                'total_users' => User::count(),
                'total_views' => Post::sum('view_count'),
            ],
            'recentPosts' => Post::query()
                ->with(['user:id,name', 'category:id,name'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (Post $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'status' => $post->status->value,
                    'author' => $post->user->name,
                    'category' => $post->category?->name,
                    'view_count' => $post->view_count,
                    'created_at' => $post->created_at->diffForHumans(),
                ]),
            'pendingPosts' => Post::query()
                ->pending()
                ->with(['user:id,name', 'category:id,name'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (Post $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'author' => $post->user->name,
                    'category' => $post->category?->name,
                    'created_at' => $post->created_at->diffForHumans(),
                ]),
        ]);
    }
}
