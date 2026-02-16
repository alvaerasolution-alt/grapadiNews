import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    FileText,
    TrendingUp,
    Clock,
    Plus,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface DashboardProps {
    stats: {
        points: number;
        published_posts: number;
        total_views: number;
        pending_posts: number;
    };
    recentLogs: Array<{
        id: number;
        points: number;
        type: string;
        reason: string;
        created_at: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ stats, recentLogs }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome back!
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Here's an overview of your contribution performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/posts/create">
                            <Button className="bg-amber-600 text-white hover:bg-amber-700">
                                <Plus className="mr-2 h-4 w-4" />
                                New Article
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Points
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {stats.points}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime earned points
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Published
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.published_posts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Live articles
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Views
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_views.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all articles
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending_posts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting review
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Point Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {recentLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm leading-none font-medium">
                                                    {log.reason}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.created_at} •{' '}
                                                    <span className="capitalize">
                                                        {log.type}
                                                    </span>
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    log.points > 0
                                                        ? 'font-bold text-amber-600'
                                                        : 'font-bold text-red-600'
                                                }
                                            >
                                                {log.points > 0 ? '+' : ''}
                                                {log.points} pts
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No recent activity.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Tips (Optional) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contributor Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="font-medium">Publishing Bonus</p>
                                <p className="text-muted-foreground">
                                    Earn 10 points for every approved article.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">View Rewards</p>
                                <p className="text-muted-foreground">
                                    Earn 1 point for every 100 views on your
                                    articles (capped at 10 pts/article).
                                </p>
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/posts"
                                    className="flex items-center text-sm font-medium text-primary hover:underline"
                                >
                                    Manage my articles{' '}
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
