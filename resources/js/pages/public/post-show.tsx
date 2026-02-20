import { Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronRight, Eye, User } from 'lucide-react';
import { useMemo } from 'react';
import PublicLayout from '@/layouts/public-layout';
import Seo, { createBlogPostingJsonLd } from '@/components/seo';
import CategoryBadge from '@/components/category-badge';
import LazyImage from '@/components/lazy-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ReadingToolbar from '@/components/reading-toolbar';
import {
    useReadingPreferences,
    THEME_STYLES,
} from '@/hooks/use-reading-preferences';
import AdSlot, { type BannerItem } from '@/components/ad-slot';
import TableOfContents, {
    injectHeadingIds,
} from '@/components/table-of-contents';
import SocialShare from '@/components/social-share';
import SidebarTrending from '@/components/sidebar-trending';
import SidebarPopular from '@/components/sidebar-popular';

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

interface TrendingPost {
    id: number;
    title: string;
    slug: string;
    view_count: number;
    category: { name: string; slug: string } | null;
}

interface Props {
    post: {
        id: number;
        title: string;
        slug: string;
        excerpt: string;
        body: string;
        featured_image: string | null;
        meta_title: string;
        meta_description: string;
        og_image: string | null;
        view_count: number;
        published_at: string;
        published_at_human: string;
        published_at_formatted: string;
        author: { name: string };
        category: { name: string; slug: string } | null;
        tags: { name: string; slug: string }[];
    };
    relatedPosts: PostCard[];
    trendingPosts: TrendingPost[];
    popularPosts: PostCard[];
    topBanners: BannerItem[];
    bottomBanners: BannerItem[];
    sidebarBanners: BannerItem[];
}

function RelatedArticleCard({ post }: { post: PostCard }) {
    return (
        <Link href={`/${post.slug}`} className="group flex gap-3 py-3">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                <LazyImage
                    src={post.featured_image}
                    alt={post.title}
                />
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold text-gray-200 group-hover:text-amber-400">
                    {post.title}
                </h4>
                <div className="mt-1 text-xs text-gray-500">
                    {post.published_at_human}
                </div>
            </div>
        </Link>
    );
}

export default function PostShow({
    post,
    relatedPosts,
    trendingPosts,
    popularPosts,
    topBanners,
    bottomBanners,
    sidebarBanners,
}: Props) {
    const { name } = usePage().props;
    const readingPrefs = useReadingPreferences();

    const articleUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/${post.slug}`
            : `/${post.slug}`;

    const jsonLd = createBlogPostingJsonLd({
        title: post.title,
        description: post.meta_description || post.excerpt,
        url: articleUrl,
        image: post.og_image || post.featured_image || undefined,
        authorName: post.author.name,
        publishedAt: post.published_at,
        siteName: String(name),
    });

    const articleStyles = readingPrefs.getArticleStyles();
    const themeStyle = THEME_STYLES[readingPrefs.preferences.theme];
    const isDark = readingPrefs.preferences.theme === 'dark';
    const processedBody = useMemo(
        () => injectHeadingIds(post.body),
        [post.body],
    );

    return (
        <PublicLayout>
            <Seo
                title={post.meta_title || post.title}
                description={post.meta_description || post.excerpt}
                ogType="article"
                ogImage={post.og_image || post.featured_image || undefined}
                jsonLd={jsonLd}
            />

            <div
                className="transition-colors duration-300"
                style={{
                    backgroundColor: themeStyle.background,
                    color: themeStyle.color,
                }}
            >
                {/* Breadcrumb */}
                <nav
                    className="mx-auto max-w-7xl px-4 py-3"
                    aria-label="Breadcrumb"
                >
                    <ol className="flex items-center gap-1 text-sm text-gray-500">
                        <li>
                            <Link href="/" className="hover:text-amber-400">
                                Home
                            </Link>
                        </li>
                        {post.category && (
                            <>
                                <li>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </li>
                                <li>
                                    <Link
                                        href={`/category/${post.category.slug}`}
                                        className="hover:text-amber-400"
                                    >
                                        {post.category.name}
                                    </Link>
                                </li>
                            </>
                        )}
                        <li>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </li>
                        <li className="line-clamp-1 text-gray-400">
                            {post.title}
                        </li>
                    </ol>
                </nav>

                {/* Reading Toolbar */}
                <div className="mx-auto max-w-7xl px-4">
                    <ReadingToolbar preferences={readingPrefs} />
                </div>

                {/* Article content area */}
                <div
                    className="mx-auto px-4 pb-10 transition-all duration-500 ease-in-out"
                    style={{ maxWidth: articleStyles.maxWidth }}
                >
                    {/* Article Header — full width above the grid */}
                    <article>
                        <header className="flex flex-col gap-3 pt-2">
                            {post.category && (
                                <Link href={`/category/${post.category.slug}`}>
                                    <CategoryBadge
                                        name={post.category.name}
                                        slug={post.category.slug}
                                    />
                                </Link>
                            )}

                            <h1 className="text-2xl leading-tight font-extrabold text-gray-100 sm:text-3xl lg:text-4xl">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    <span>{post.author.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={post.published_at}>
                                        {post.published_at_formatted}
                                    </time>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    <span>
                                        {post.view_count.toLocaleString()} views
                                    </span>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {post.featured_image && (
                            <div className="mt-5 max-h-[520px] overflow-hidden rounded-xl">
                                <LazyImage
                                    src={post.featured_image}
                                    alt={post.title}
                                    priority
                                    fetchPriority="high"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Top Banners */}
                        <AdSlot
                            banners={topBanners}
                            mgidWidgetKey="article_top"
                            className="my-5"
                        />

                        {/* Mobile TOC */}
                        <div className="lg:hidden">
                            <TableOfContents
                                htmlContent={post.body}
                                isDark={isDark}
                            />
                        </div>

                        <Separator className="my-5 bg-gray-800" />
                    </article>

                    {/* 2-Column Grid: Article Body + Sidebar */}
                    {/* Sidebar sticky stops when this grid container ends */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
                        {/* ===== LEFT: Article Body ===== */}
                        <div className="min-w-0">
                            {/* Article Body */}
                            <div
                                className={`prose max-w-none prose-invert ${readingPrefs.preferences.theme === 'warm'
                                    ? 'prose-amber'
                                    : ''
                                    }`}
                                style={{
                                    fontSize: articleStyles.fontSize,
                                    fontFamily: articleStyles.fontFamily,
                                    lineHeight: articleStyles.lineHeight,
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: processedBody,
                                }}
                            />
                        </div>

                        {/* ===== RIGHT: Sidebar (sticky within this grid row) ===== */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-20 space-y-6">
                                {/* Desktop TOC */}
                                <TableOfContents
                                    htmlContent={post.body}
                                    isDark={isDark}
                                />

                                {/* Trending Topics */}
                                <SidebarTrending posts={trendingPosts} />

                                {/* Sidebar Ad */}
                                <AdSlot
                                    banners={sidebarBanners}
                                    layout="vertical"
                                    mgidWidgetKey="article_sidebar"
                                />

                                {/* Popular Posts */}
                                <SidebarPopular posts={popularPosts} />
                            </div>
                        </aside>
                    </div>

                    {/* Below-article sections — full width, no sidebar */}
                    <div className="mt-6 lg:max-w-[calc(100%-320px-2rem)]">
                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div>
                                <Separator className="mb-5 bg-gray-800" />
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <Link
                                            key={tag.slug}
                                            href={`/tag/${tag.slug}`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-800 text-gray-300 hover:bg-amber-900/40 hover:text-amber-400"
                                            >
                                                #{tag.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bottom Social Share */}
                        <div className="mt-6">
                            <Separator className="mb-5 bg-gray-800" />
                            <SocialShare url={articleUrl} title={post.title} />
                        </div>

                        {/* Bottom Banners */}
                        <AdSlot
                            banners={bottomBanners}
                            mgidWidgetKey="article_bottom"
                            className="my-6"
                        />

                        {/* Related Articles */}
                        {relatedPosts.length > 0 && (
                            <div className="mt-6">
                                <h3 className="mb-3 text-lg font-bold text-gray-200">
                                    Baca Juga
                                </h3>
                                <div className="divide-y divide-gray-800">
                                    {relatedPosts.map((relatedPost) => (
                                        <RelatedArticleCard
                                            key={relatedPost.id}
                                            post={relatedPost}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
