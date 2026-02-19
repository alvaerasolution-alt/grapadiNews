import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { BreadcrumbItem, PaginatedResponse } from '@/types';

interface CategoryWithCount {
    id: number;
    name: string;
    slug: string;
    description?: string;
    posts_count: number;
}

interface AdminCategoriesIndexProps {
    categories: PaginatedResponse<CategoryWithCount>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Categories', href: '/admin/categories' },
];

export default function AdminCategoriesIndex({
    categories,
}: AdminCategoriesIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] =
        useState<CategoryWithCount | null>(null);

    function handleDeleteClick(category: CategoryWithCount) {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    }

    function confirmDelete() {
        if (categoryToDelete) {
            router.delete(`/admin/categories/${categoryToDelete.slug}`);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage post categories.
                        </p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button className="bg-amber-600 text-white hover:bg-amber-700">
                            <Plus className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            All Categories ({categories.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[400px] text-sm">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Slug
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Posts
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {categories.data.length > 0 ? (
                                        categories.data.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="border-b transition-colors hover:bg-muted/50"
                                            >
                                                <td className="p-4 align-middle font-medium">
                                                    {category.name}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {category.slug}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {category.posts_count}
                                                </td>
                                                <td className="p-4 text-right align-middle">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/admin/categories/${category.slug}/edit`}
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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    category,
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
                                                colSpan={4}
                                                className="p-4 text-center text-muted-foreground"
                                            >
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {categories.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm ${link.active
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

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                            <DialogDescription>
                                {categoryToDelete?.posts_count &&
                                    categoryToDelete.posts_count > 0 ? (
                                    <span className="text-red-500">
                                        Cannot delete &quot;
                                        {categoryToDelete.name}&quot; because it
                                        has {categoryToDelete.posts_count}{' '}
                                        posts. Please move or delete the posts
                                        first.
                                    </span>
                                ) : (
                                    <span>
                                        Are you sure you want to delete &quot;
                                        {categoryToDelete?.name}&quot;? This
                                        action cannot be undone.
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            {(!categoryToDelete?.posts_count ||
                                categoryToDelete.posts_count === 0) && (
                                    <Button
                                        variant="destructive"
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </Button>
                                )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
