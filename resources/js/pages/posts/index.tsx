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
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'My Articles',
        href: '/posts',
    },
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            My Articles
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and track performance of your content.
                        </p>
                    </div>
                    <Link href="/posts/create">
                        <Button className="bg-amber-600 text-white hover:bg-amber-700">
                            <Plus className="mr-2 h-4 w-4" />
                            New Article
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Title
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Category
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Performance
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {posts.data.length > 0 ? (
                                        posts.data.map((post) => (
                                            <tr
                                                key={post.id}
                                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                            >
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {post.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground md:hidden">
                                                            {post.excerpt?.substring(
                                                                0,
                                                                50,
                                                            )}
                                                            ...
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <CategoryBadge
                                                        name={
                                                            post.category.name
                                                        }
                                                        slug={
                                                            post.category.slug
                                                        }
                                                    />
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <StatusBadge
                                                        status={post.status}
                                                    />
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Eye className="h-3 w-3" />
                                                            {post.view_count.toLocaleString()}
                                                        </div>
                                                        {(post.points_awarded_on_publish >
                                                            0 ||
                                                            post.points_awarded_from_views >
                                                                0) && (
                                                            <div className="flex items-center gap-1 font-medium text-amber-600">
                                                                <Award className="h-3 w-3" />
                                                                {post.points_awarded_on_publish +
                                                                    post.points_awarded_from_views}{' '}
                                                                pts
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {new Date(
                                                        post.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right align-middle">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/posts/${post.slug}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Edit
                                                                </span>
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/posts/${post.slug}`}
                                                            method="delete"
                                                            as="button"
                                                            only={['posts']}
                                                            onSuccess={() =>
                                                                alert(
                                                                    'Post deleted',
                                                                )
                                                            } // Primitive, but functional
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Delete
                                                                </span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-4 text-center text-muted-foreground"
                                            >
                                                No articles found. Start
                                                writing!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination would go here */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
