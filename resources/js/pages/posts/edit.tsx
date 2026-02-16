import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PostForm from '@/components/post-form';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Category, Post, Tag } from '@/types';

interface EditPostProps {
    post: Post;
    categories: Category[];
    tags: Tag[];
}

export default function EditPost({ post, categories, tags }: EditPostProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'My Articles',
            href: '/posts',
        },
        {
            title: 'Edit Article',
            href: `/posts/${post.slug}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${post.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Article
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update your content.
                    </p>
                </div>

                <PostForm post={post} categories={categories} tags={tags} />
            </div>
        </AppLayout>
    );
}
