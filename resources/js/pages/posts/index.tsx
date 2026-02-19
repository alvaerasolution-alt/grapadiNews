import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Award } from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import CategoryBadge from '@/components/category-badge';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, PaginatedResponse, Post } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'My Articles', href: '/posts' },
];

interface PostsIndexProps {
    posts: PaginatedResponse<Post>;
}

export default function PostsIndex({ posts }: PostsIndexProps) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Articles" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">My Articles</h1>
                        <p className="text-sm text-muted-foreground">Manage and track your content.</p>
                    </div>
                    <Link href="/posts/create" className="shrink-0">
                        <Button className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            New Article
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>All Posts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile: Card list */}
                        <div className="divide-y sm:hidden">
                            {posts.data.length > 0 ? (
                                posts.data.map((post) => (
                                    <div key={post.id} className="flex items-start justify-between gap-3 p-4">
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <p className="font-medium leading-snug line-clamp-2">{post.title}</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge status={post.status} />
                                                <CategoryBadge
                                                    name={post.category.name}
                                                    slug={post.category.slug}
                                                    className="text-[10px]"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {post.view_count.toLocaleString()} views
                                                </span>
                                                {(post.points_awarded_on_publish > 0 || post.points_awarded_from_views > 0) && (
                                                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                        <Award className="h-3 w-3" />
                                                        {post.points_awarded_on_publish + post.points_awarded_from_views} pts
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Link href={`/posts/${post.slug}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/posts/${post.slug}`}
                                                method="delete"
                                                as="button"
                                                only={['posts']}
                                                onSuccess={() => alert('Post deleted')}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    No articles found. Start writing!
                                </div>
                            )}
                        </div>

                        {/* Desktop: Table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground md:table-cell">Performance</th>
                                        <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground lg:table-cell">Date</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {posts.data.length > 0 ? (
                                        posts.data.map((post) => (
                                            <tr key={post.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium max-w-xs">
                                                    <span className="line-clamp-2">{post.title}</span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <CategoryBadge name={post.category.name} slug={post.category.slug} />
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <StatusBadge status={post.status} />
                                                </td>
                                                <td className="hidden p-4 align-middle md:table-cell">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Eye className="h-3 w-3" />
                                                            {post.view_count.toLocaleString()}
                                                        </div>
                                                        {(post.points_awarded_on_publish > 0 || post.points_awarded_from_views > 0) && (
                                                            <div className="flex items-center gap-1 font-medium text-amber-600">
                                                                <Award className="h-3 w-3" />
                                                                {post.points_awarded_on_publish + post.points_awarded_from_views} pts
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="hidden p-4 align-middle text-muted-foreground lg:table-cell">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right align-middle">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/posts/${post.slug}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/posts/${post.slug}`}
                                                            method="delete"
                                                            as="button"
                                                            only={['posts']}
                                                            onSuccess={() => alert('Post deleted')}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No articles found. Start writing!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
