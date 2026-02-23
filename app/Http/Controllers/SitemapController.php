<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $posts = Post::published()->latest('updated_at')->get();
        // Only get categories and tags that have published posts
        $categories = Category::whereHas('posts', function ($q) {
            $q->where('status', 'published');
        })->get();
        
        $tags = \App\Models\Tag::whereHas('posts', function ($q) {
            $q->where('status', 'published');
        })->get();

        return response()->view('sitemap.index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
        ])->header('Content-Type', 'text/xml');
    }
}
