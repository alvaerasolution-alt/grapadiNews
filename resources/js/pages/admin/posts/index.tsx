import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/status-badge';
import CategoryBadge from '@/components/category-badge';
import { Eye, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem, Category, PaginatedResponse } from '@/types';

interface AdminPost {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    view_count: number;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    category: Category;
}

interface AdminPostsIndexProps {
    posts: PaginatedResponse<AdminPost>;
    categories: Category[];
    filters: {
        search?: string;
        status?: string;
        category?: string;
    };
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Posts', href: '/admin/posts' },
];

export default function AdminPostsIndex({
    posts,
    categories,
    filters,
    statuses,
}: AdminPostsIndexProps) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(newFilters: Record<string, string | undefined>) {
        router.get(
            '/admin/posts',
            {
                ...filters,
                ...newFilters,
                page: undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        applyFilters({ search });
    }

    function handleDelete(slug: string) {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/admin/posts/${slug}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Posts" />
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
                    <h1 className="text-2xl font-bold tracking-tight">
                        Manage Posts
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review and manage all posts across the platform.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-1 items-center gap-2"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search posts..."
                                value={search}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.category ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                category: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Posts ({posts.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Title
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Author
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Category
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Views
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
                                                className="border-b transition-colors hover:bg-muted/50"
                                            >
                                                <td className="p-4 align-middle font-medium">
                                                    <Link
                                                        href={`/admin/posts/${post.slug}`}
                                                        className="hover:underline"
                                                    >
                                                        {post.title}
                                                    </Link>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {post.user.name}
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
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {post.view_count.toLocaleString()}
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
                                                            href={`/admin/posts/${post.slug}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    View
                                                                </span>
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    post.slug,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Delete
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="p-4 text-center text-muted-foreground"
                                            >
                                                No posts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {posts.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm ${
                                            link.active
                                                ? 'bg-amber-600 text-white'
                                                : link.url
                                                  ? 'hover:bg-muted'
                                                  : 'pointer-events-none text-muted-foreground'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
