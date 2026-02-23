<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $data = [
            'post_id' => $post->id,
            'body' => $request->validated('body'),
        ];

        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        } else {
            $data['guest_name'] = $request->validated('guest_name');
            $data['guest_email'] = $request->validated('guest_email');
        }

        Comment::create($data);

        return back();
    }

    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($comment->user_id !== $user->id && ! $user->hasRole('admin')) {
            abort(403);
        }

        $comment->delete();

        return back();
    }
}
