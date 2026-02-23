<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $sessionKey = 'liked_posts';
        $likedPosts = $request->session()->get($sessionKey, []);

        if (in_array($post->id, $likedPosts)) {
            // Unlike: remove from session
            $likedPosts = array_values(array_diff($likedPosts, [$post->id]));
            $post->likes()->where('session_id', $request->session()->getId())->delete();
        } else {
            // Like: add to session
            $likedPosts[] = $post->id;
            $post->likes()->updateOrCreate(
                ['session_id' => $request->session()->getId()],
                []
            );
        }

        $request->session()->put($sessionKey, $likedPosts);

        return back();
    }
}
