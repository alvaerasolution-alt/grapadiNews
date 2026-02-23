import { Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import Seo from '@/components/seo';
import CategoryBadge from '@/components/category-badge';
import LazyImage from '@/components/lazy-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PaginatedResponse } from '@/types';
import AdSlot, { type BannerItem } from '@/components/ad-slot';
import { Hash } from 'lucide-react';

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

interface TagWithCount {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface Props {
    tag: {
        id: number;
        name: string;
        slug: string;
    };
    posts: PaginatedResponse<PostCard>;
    popularTags: TagWithCount[];
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
                <LazyImage
                    src={post.featured_image}
                    alt={post.title}
                    className="transition-transform duration-300 group-hover:scale-105"
                />
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

export default function TagShow({
    tag,
    posts,
    popularTags,
    topBanners,
    sidebarBanners,
}: Props) {
    return (
        <PublicLayout>
            <Seo
                title={`Tag: ${tag.name}`}
                description={`Artikel dengan tag ${tag.name}`}
            />

            {/* Tag Header */}
            <section className="border-b border-gray-800 bg-[#111111]">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                            <Hash className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-100">
                                {tag.name}
                            </h1>
                            <p className="text-sm text-gray-400">
                                {posts.total} artikel dengan tag ini
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ad: Top Banner */}
            <AdSlot
                banners={topBanners}
                layout="horizontal"
                mgidWidgetKey="tag_top"
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
                                Belum ada artikel dengan tag ini.
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
                                        &larr; Sebelumnya
                                    </Link>
                                ) : (
                                    <span />
                                )}
                                <span className="text-sm text-gray-500">
                                    Halaman {posts.current_page} dari{' '}
                                    {posts.last_page}
                                </span>
                                {posts.next_page_url ? (
                                    <Link
                                        href={posts.next_page_url}
                                        className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                                    >
                                        Selanjutnya &rarr;
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
                                mgidWidgetKey="tag_sidebar"
                            />

                            {/* Popular Tags */}
                            <div className="rounded-xl border border-gray-800 bg-[#1A1A1A] p-6">
                                <h3 className="text-lg font-bold text-gray-100">
                                    Tag Populer
                                </h3>
                                <Separator className="my-4 bg-gray-800" />
                                <div className="flex flex-wrap gap-2">
                                    {popularTags.map((t) => (
                                        <Link
                                            key={t.id}
                                            href={`/tag/${t.slug}`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className={`cursor-pointer transition-colors ${t.slug === tag.slug
                                                        ? 'bg-amber-600 text-white hover:bg-amber-500'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-amber-900/40 hover:text-amber-400'
                                                    }`}
                                            >
                                                #{t.name}
                                                <span className="ml-1 text-xs opacity-60">
                                                    ({t.posts_count})
                                                </span>
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </PublicLayout>
    );
}
