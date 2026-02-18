import { Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import Seo from '@/components/seo';
import CategoryBadge from '@/components/category-badge';
import { Separator } from '@/components/ui/separator';
import type { PaginatedResponse } from '@/types';
import AdSlot, { type BannerItem } from '@/components/ad-slot';

interface PostCard {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    view_count: number;
    published_at: string;
    published_at_human: string;
    author: { name: string };
    category: { name: string; slug: string } | null;
}

interface CategoryWithCount {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface Props {
    category: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    };
    posts: PaginatedResponse<PostCard>;
    categories: CategoryWithCount[];
    topBanners: BannerItem[];
    sidebarBanners: BannerItem[];
}

function ArticleCard({ post }: { post: PostCard }) {
    return (
        <Link
            href={`/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#1A1A1A] transition-shadow hover:shadow-lg hover:shadow-black/30"
        >
            <div className="aspect-video overflow-hidden bg-gray-800">
                {post.featured_image ? (
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500">
                        <span className="text-sm">No image</span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
                {post.category && (
                    <CategoryBadge
                        name={post.category.name}
                        slug={post.category.slug}
                    />
                )}
                <h3 className="line-clamp-2 text-base font-bold text-gray-100 group-hover:text-amber-400">
                    {post.title}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-400">
                    {post.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 text-xs text-gray-500">
                    <span>{post.author.name}</span>
                    <span>&middot;</span>
                    <span>{post.published_at_human}</span>
                </div>
            </div>
        </Link>
    );
}

export default function CategoryShow({
    category,
    posts,
    categories,
    topBanners,
    sidebarBanners,
}: Props) {
    return (
        <PublicLayout>
            <Seo
                title={category.name}
                description={
                    category.description ||
                    `Artikel terbaru dalam kategori ${category.name}`
                }
            />

            {/* Category Header */}
            <section className="border-b border-gray-800 bg-[#111111]">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <h1 className="text-3xl font-extrabold text-gray-100">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="mt-2 text-gray-400">
                            {category.description}
                        </p>
                    )}
                </div>
            </section>

            {/* Ad: Top Banner */}
            <AdSlot
                banners={topBanners}
                layout="horizontal"
                googleAdSlot="category_top"
                className="mx-auto mt-6 max-w-7xl px-4"
            />

            {/* Content */}
            <section className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Articles Grid */}
                    <div className="lg:col-span-3">
                        {posts.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <ArticleCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <p className="py-12 text-center text-gray-500">
                                No articles found in this category.
                            </p>
                        )}

                        {/* Pagination */}
                        {(posts.prev_page_url || posts.next_page_url) && (
                            <div className="mt-8 flex items-center justify-between">
                                {posts.prev_page_url ? (
                                    <Link
                                        href={posts.prev_page_url}
                                        className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                                    >
                                        &larr; Previous
                                    </Link>
                                ) : (
                                    <span />
                                )}
                                <span className="text-sm text-gray-500">
                                    Page {posts.current_page} of{' '}
                                    {posts.last_page}
                                </span>
                                {posts.next_page_url ? (
                                    <Link
                                        href={posts.next_page_url}
                                        className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                                    >
                                        Next &rarr;
                                    </Link>
                                ) : (
                                    <span />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside>
                        <div className="sticky top-20 space-y-6">
                            {/* Ad: Sidebar */}
                            <AdSlot
                                banners={sidebarBanners}
                                layout="vertical"
                                googleAdSlot="category_sidebar"
                            />

                            {/* Categories */}
                            <div className="rounded-xl border border-gray-800 bg-[#1A1A1A] p-6">
                                <h3 className="text-lg font-bold text-gray-100">
                                    Categories
                                </h3>
                                <Separator className="my-4 bg-gray-800" />
                                <nav className="flex flex-col gap-1">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                                                cat.slug === category.slug
                                                    ? 'bg-amber-900/40 font-semibold text-amber-400'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                            }`}
                                        >
                                            <span>{cat.name}</span>
                                            <span
                                                className={`text-xs ${
                                                    cat.slug === category.slug
                                                        ? 'text-amber-500'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                {cat.posts_count}
                                            </span>
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </PublicLayout>
    );
}
