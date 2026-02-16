import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PostForm from '@/components/post-form';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Category, Tag } from '@/types';

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
        title: 'New Article',
        href: '/posts/create',
    },
];

interface CreatePostProps {
    categories: Category[];
    tags: Tag[];
}

export default function CreatePost({ categories, tags }: CreatePostProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Article" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        New Article
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new article for review.
                    </p>
                </div>

                <PostForm categories={categories} tags={tags} />
            </div>
        </AppLayout>
    );
}
