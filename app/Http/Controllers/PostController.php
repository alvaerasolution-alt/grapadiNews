<?php

namespace App\Http\Controllers;

use App\Helpers\ImageHelper;
use App\Http\Requests\PostRequest;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $posts = $request->user()->posts()
            ->with(['category'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('posts/index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('posts/create', [
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'tags' => Tag::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = ImageHelper::storeAsWebp(
                $request->file('featured_image'),
                'posts',
                quality: 80,
                maxWidth: 1200,
            );
        }

        $post = $request->user()->posts()->create($data);

        if (isset($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return redirect()->route('posts.index')
            ->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return redirect()->route('posts.edit', $post);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post): Response
    {
        abort_if($post->user_id !== auth()->id(), 403);

        $post->load('tags');

        return Inertia::render('posts/edit', [
            'post' => $post,
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'tags' => Tag::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostRequest $request, Post $post)
    {
        abort_if($post->user_id !== auth()->id(), 403);

        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            // Delete old image
            ImageHelper::delete($post->featured_image);

            $data['featured_image'] = ImageHelper::storeAsWebp(
                $request->file('featured_image'),
                'posts',
                quality: 80,
                maxWidth: 1200,
            );
        } else {
            unset($data['featured_image']);
        }

        $post->update($data);

        if (isset($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return redirect()->route('posts.index')
            ->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        abort_if($post->user_id !== auth()->id(), 403);

        ImageHelper::delete($post->featured_image);

        $post->delete();

        return redirect()->back()
            ->with('success', 'Post deleted successfully.');
    }
}
