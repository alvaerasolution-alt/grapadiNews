import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/status-badge';
import {
    FileText,
    Users,
    Eye,
    Clock,
    CheckCircle,
    ArrowRight,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface PostSummary {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    view_count: number;
    created_at: string;
    author: string;
    category?: string;
}

interface AdminDashboardProps {
    stats: {
        total_posts: number;
        published_posts: number;
        pending_posts: number;
        total_users: number;
        total_views: number;
    };
    recentPosts: PostSummary[];
    pendingPosts: PostSummary[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
];

export default function AdminDashboard({
    stats,
    recentPosts,
    pendingPosts,
}: AdminDashboardProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of your news platform.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Posts
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_posts}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Published
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {stats.published_posts}
                            </div>
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
                            <div className="text-2xl font-bold text-primary">
                                {stats.pending_posts}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_users}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Views
                            </CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_views.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Posts */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Posts</CardTitle>
                            <Link
                                href="/admin/posts"
                                className="flex items-center text-sm font-medium text-primary hover:underline"
                            >
                                View all
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[340px] text-sm">
                                    <thead className="bg-muted/50 [&_tr]:border-b">
                                        <tr className="border-b">
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Title
                                            </th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {recentPosts.length > 0 ? (
                                            recentPosts.map((post) => (
                                                <tr
                                                    key={post.id}
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <Link
                                                            href={`/admin/posts/${post.slug}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                            by {post.author}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <StatusBadge
                                                            status={post.status}
                                                        />
                                                    </td>
                                                    <td className="p-4 align-middle text-muted-foreground">
                                                        {new Date(
                                                            post.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="p-4 text-center text-muted-foreground"
                                                >
                                                    No recent posts.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Review */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pending Review</CardTitle>
                            <Link
                                href="/admin/posts?status=pending"
                                className="flex items-center text-sm font-medium text-primary hover:underline"
                            >
                                View all
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[340px] text-sm">
                                    <thead className="bg-muted/50 [&_tr]:border-b">
                                        <tr className="border-b">
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Title
                                            </th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Author
                                            </th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Submitted
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {pendingPosts.length > 0 ? (
                                            pendingPosts.map((post) => (
                                                <tr
                                                    key={post.id}
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <Link
                                                            href={`/admin/posts/${post.slug}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                    </td>
                                                    <td className="p-4 align-middle text-muted-foreground">
                                                        {post.author}
                                                    </td>
                                                    <td className="p-4 align-middle text-muted-foreground">
                                                        {new Date(
                                                            post.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="p-4 text-center text-muted-foreground"
                                                >
                                                    No posts pending review.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
