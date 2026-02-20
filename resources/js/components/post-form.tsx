import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import TiptapEditor from '@/components/editor/tiptap-editor';
import { Category, Post, Tag } from '@/types';
import { FormEventHandler, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface PostFormProps {
    post?: Post;
    categories: Category[];
    tags: Tag[];
}

export default function PostForm({ post, categories, tags }: PostFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        post?.featured_image ? `/storage/${post.featured_image}` : null,
    );

    const {
        data,
        setData,
        post: submitPost,
        processing,
        errors,
    } = useForm<{
        title: string;
        slug: string;
        category_id: string;
        excerpt: string;
        body: string;
        status: 'draft' | 'pending' | 'published' | 'rejected';
        meta_title: string;
        meta_description: string;
        featured_image: File | null;
        _method?: string;
    }>({
        title: post?.title || '',
        slug: post?.slug || '',
        category_id: post?.category_id?.toString() || '',
        excerpt: post?.excerpt || '',
        body: post?.body || '',
        status: (post?.status || 'draft') as
            | 'draft'
            | 'pending'
            | 'published'
            | 'rejected',
        meta_title: post?.meta_title || '',
        meta_description: post?.meta_description || '',
        featured_image: null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('featured_image', file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('featured_image', null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (post) {
            setData('_method', 'PUT');
            submitPost(`/posts/${post.slug}`, {
                forceFormData: true,
                headers: { 'X-HTTP-Method-Override': 'PUT' },
            });
        } else {
            submitPost('/posts', {
                forceFormData: true,
            });
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                {/* Main Content */}
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => setData('title', e.target.value)}
                                placeholder="Article title"
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="body">Content</Label>
                            <TiptapEditor
                                content={data.body}
                                onChange={(html) => setData('body', html)}
                                placeholder="Write your article content here..."
                            />
                            {errors.body && (
                                <p className="text-sm text-destructive">
                                    {errors.body}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                            SEO Settings
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                value={data.meta_title}
                                onChange={(e) =>
                                    setData('meta_title', e.target.value)
                                }
                                placeholder="SEO Title (max 60 chars)"
                                maxLength={60}
                            />
                            <div className="text-right text-xs text-muted-foreground">
                                {data.meta_title.length}/60
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta_description">
                                Meta Description
                            </Label>
                            <Textarea
                                id="meta_description"
                                value={data.meta_description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    setData('meta_description', e.target.value)
                                }
                                placeholder="SEO Description (max 160 chars)"
                                maxLength={160}
                                className="h-20"
                            />
                            <div className="text-right text-xs text-muted-foreground">
                                {data.meta_description.length}/160
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Featured Image */}
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Featured Image
                        </h3>

                        {imagePreview ? (
                            <div className="group relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-48 w-full rounded-lg border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600"
                            >
                                <ImagePlus className="h-8 w-8" />
                                <span className="text-sm font-medium">
                                    Upload Image
                                </span>
                                <span className="text-xs">
                                    JPG, PNG, GIF, WebP — Max 10MB
                                </span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {imagePreview && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                            >
                                Change Image
                            </Button>
                        )}

                        {errors.featured_image && (
                            <p className="text-sm text-destructive">
                                {errors.featured_image}
                            </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Gambar akan otomatis dikonversi ke WebP untuk
                            performa terbaik.
                        </p>
                    </CardContent>
                </Card>

                {/* Publishing Options */}
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value: string) =>
                                    setData(
                                        'status',
                                        value as
                                        | 'draft'
                                        | 'pending'
                                        | 'published'
                                        | 'rejected',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending">
                                        Submit for Review
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-destructive">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) =>
                                    setData('category_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && (
                                <p className="text-sm text-destructive">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea
                                id="excerpt"
                                value={data.excerpt}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) => setData('excerpt', e.target.value)}
                                placeholder="Short summary..."
                                className="h-32"
                            />
                            {errors.excerpt && (
                                <p className="text-sm text-destructive">
                                    {errors.excerpt}
                                </p>
                            )}
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-amber-600 text-white hover:bg-amber-700"
                            >
                                {post ? 'Update Article' : 'Save Article'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
