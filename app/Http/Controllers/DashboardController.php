<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('dashboard', [
            'stats' => [
                'points' => $user->points,
                'published_posts' => $user->posts()->published()->count(),
                'total_views' => $user->posts()->sum('view_count'),
                'pending_posts' => $user->posts()->pending()->count(),
            ],
            'recentLogs' => $user->pointLogs()
                ->latest('created_at')
                ->take(5)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'points' => $log->points,
                    'type' => $log->type,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at->diffForHumans(),
                ]),
        ]);
    }
}
