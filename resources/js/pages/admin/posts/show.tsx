import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import StatusBadge from '@/components/status-badge';
import CategoryBadge from '@/components/category-badge';
import {
    Eye,
    Trash2,
    CheckCircle,
    XCircle,
    Send,
    ArrowLeft,
    Calendar,
    User,
} from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem, Category, Tag } from '@/types';

interface PostDetail {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    view_count: number;
    created_at: string;
    updated_at: string;
    featured_image?: string;
    meta_title?: string;
    meta_description?: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    category: Category;
    tags?: Tag[];
}

interface AdminPostShowProps {
    post: PostDetail;
}

export default function AdminPostShow({ post }: AdminPostShowProps) {
    const { flash } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin' },
        { title: 'Posts', href: '/admin/posts' },
        { title: post.title, href: `/admin/posts/${post.slug}` },
    ];

    function updateStatus(status: string) {
        setProcessing(true);
        router.patch(
            `/admin/posts/${post.slug}/status`,
            { status },
            {
                onFinish: () => setProcessing(false),
            },
        );
    }

    function handleDelete() {
        router.delete(`/admin/posts/${post.slug}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review: ${post.title}`} />
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

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/posts">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Review Post
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Review and manage post status.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {post.status !== 'published' && (
                            <Button
                                className="bg-amber-600 text-white hover:bg-amber-700"
                                onClick={() => updateStatus('published')}
                                disabled={processing}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                            </Button>
                        )}
                        {post.status === 'pending' && (
                            <Button
                                variant="outline"
                                onClick={() => updateStatus('rejected')}
                                disabled={processing}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        )}
                        {post.status === 'draft' && (
                            <Button
                                variant="outline"
                                onClick={() => updateStatus('pending')}
                                disabled={processing}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Mark Pending
                            </Button>
                        )}
                        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Post</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete &quot;
                                        {post.title}&quot;? This action cannot
                                        be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    {post.title}
                                </CardTitle>
                                {post.excerpt && (
                                    <CardDescription>
                                        {post.excerpt}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                {post.featured_image && (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="mb-6 w-full rounded-lg object-cover"
                                    />
                                )}
                                <div
                                    className="prose max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{
                                        __html: post.body,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Post Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Status
                                    </span>
                                    <StatusBadge status={post.status} />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Category
                                    </span>
                                    <CategoryBadge
                                        name={post.category.name}
                                        slug={post.category.slug}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Views
                                    </span>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Eye className="h-3 w-3" />
                                        {post.view_count.toLocaleString()}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Author
                                    </span>
                                    <div className="flex items-center gap-1 text-sm">
                                        <User className="h-3 w-3" />
                                        {post.user.name}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Created
                                    </span>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(
                                            post.created_at,
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                                {post.tags && post.tags.length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <span className="mb-2 block text-sm text-muted-foreground">
                                                Tags
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {post.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="secondary"
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Author Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>
                                    <span className="text-muted-foreground">
                                        Name:{' '}
                                    </span>
                                    {post.user.name}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Email:{' '}
                                    </span>
                                    {post.user.email}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
