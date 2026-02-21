import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import Seo, { createWebSiteJsonLd } from '@/components/seo';
import CategoryBadge from '@/components/category-badge';
import LazyImage from '@/components/lazy-image';
import { Separator } from '@/components/ui/separator';
import type { PaginatedResponse } from '@/types';
import AdSlot, { type BannerItem } from '@/components/ad-slot';
import AdPopup from '@/components/ad-popup';
import CurrencyWidget from '@/components/currency-widget';

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

interface CategoryWithCount {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface CategorySection {
    id: number;
    name: string;
    slug: string;
    posts: PostCard[];
}

interface Props {
    featuredPosts: PostCard[];
    latestPosts: PaginatedResponse<PostCard>;
    trendingPosts: TrendingPost[];
    categories: CategoryWithCount[];
    categoryPosts: CategorySection[];
    belowNavbarBanners: BannerItem[];
    heroBelowBanners: BannerItem[];
    sidebarBanners: BannerItem[];
    feedInlineBanners: BannerItem[];
    homeMidBanners: BannerItem[];
    homeLeftBanners: BannerItem[];
    homeRightBanners: BannerItem[];
    popupBanners: BannerItem[];
}

/* ─── Full Article Card (grid) ─── */
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

/* ─── Compact Horizontal Card (thumbnail left + content right) ─── */
function CompactArticleCard({ post }: { post: PostCard }) {
    return (
        <Link
            href={`/${post.slug}`}
            className="group flex gap-4 rounded-lg border border-gray-800/60 bg-[#1A1A1A] p-3 transition-colors hover:bg-white/5"
        >
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-800 sm:h-24 sm:w-36">
                <LazyImage
                    src={post.featured_image}
                    alt={post.title}
                    className="transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                {post.category && (
                    <CategoryBadge
                        name={post.category.name}
                        slug={post.category.slug}
                        className="text-[10px]"
                    />
                )}
                <h4 className="line-clamp-2 text-sm font-bold text-gray-200 group-hover:text-amber-400">
                    {post.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{post.author.name}</span>
                    <span>&middot;</span>
                    <span>{post.published_at_human}</span>
                </div>
            </div>
        </Link>
    );
}

export default function Home({
    featuredPosts,
    latestPosts,
    trendingPosts,
    categories,
    categoryPosts,
    belowNavbarBanners,
    heroBelowBanners,
    sidebarBanners,
    feedInlineBanners,
    homeMidBanners,
    homeLeftBanners,
    homeRightBanners,
    popupBanners,
}: Props) {
    const { name } = usePage().props;
    const hero = featuredPosts[0];
    const sideFeatures = featuredPosts.slice(1, 5);

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const jsonLd = createWebSiteJsonLd({
        name: String(name),
        url: siteUrl,
        description: 'Berita terkini dan terpercaya dari GrapadiNews',
    });

    // Split articles for inline ad insertion
    const firstBatch = latestPosts.data.slice(0, 3);
    const restBatch = latestPosts.data.slice(3);

    return (
        <PublicLayout>
            <Seo
                description="Berita terkini dan terpercaya dari GrapadiNews"
                jsonLd={jsonLd}
            />

            {/* Currency Widget: shown above hero */}
            <CurrencyWidget />

            <div className="mx-auto flex w-full max-w-[1920px] justify-center px-0 lg:gap-6 lg:px-4">
                {/* Left Skin Banner */}
                {homeLeftBanners && homeLeftBanners.length > 0 && (
                    <aside className="hidden w-[160px] shrink-0 xl:block xl:w-[200px] 2xl:w-[300px]">
                        <div className="sticky top-24 pt-4">
                            <AdSlot
                                banners={homeLeftBanners}
                                layout="vertical"
                                mgidWidgetKey="home_left_skin"
                            />
                        </div>
                    </aside>
                )}

                {/* Main Content Wrapper */}
                <div
                    className={`min-w-0 flex-1 transition-all duration-300 ${(homeLeftBanners?.length || 0) > 0 ||
                            (homeRightBanners?.length || 0) > 0
                            ? 'max-w-5xl'
                            : 'max-w-7xl'
                        }`}
                >
                    {/* Banner: Below Navbar */}
                    {belowNavbarBanners && belowNavbarBanners.length > 0 && (
                        <section className="w-full px-4 pt-4">
                            <AdSlot
                                banners={belowNavbarBanners}
                                layout="horizontal"
                                linkClassName="w-full"
                                imageClassName="max-h-[200px] w-full object-cover"
                            />
                        </section>
                    )}

                    {/* Hero Featured Section */}
                    {hero && (
                        <section className="w-full px-4 pt-6">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                                {/* Main hero card */}
                                <Link
                                    href={`/${hero.slug}`}
                                    className="group relative overflow-hidden rounded-xl lg:col-span-3 aspect-[4/3] lg:aspect-auto lg:h-full"
                                >
                                    <LazyImage
                                        src={hero.featured_image}
                                        alt={hero.title}
                                        priority
                                        fetchPriority="high"
                                        naturalSize
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 flex flex-col gap-3 p-6">
                                        {hero.category && (
                                            <CategoryBadge
                                                name={hero.category.name}
                                                slug={hero.category.slug}
                                            />
                                        )}
                                        <h2 className="text-2xl font-extrabold text-white lg:text-3xl">
                                            {hero.title}
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            {hero.author.name} &middot;{' '}
                                            {hero.published_at_human}
                                        </p>
                                    </div>
                                </Link>

                                {/* 2x2 smaller featured cards */}
                                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                                    {sideFeatures.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/${post.slug}`}
                                            className="group relative overflow-hidden rounded-xl"
                                        >
                                            <div className="aspect-[4/3]">
                                                <LazyImage
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    className="transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 flex flex-col gap-1.5 p-3">
                                                {post.category && (
                                                    <CategoryBadge
                                                        name={post.category.name}
                                                        slug={post.category.slug}
                                                        className="text-[8px]"
                                                    />
                                                )}
                                                <h3 className="line-clamp-2 text-sm font-bold text-white">
                                                    {post.title}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}


                    {/* Banner: Below Hero */}
                    {heroBelowBanners && heroBelowBanners.length > 0 && (
                        <section className="w-full px-4 pt-6">
                            <AdSlot
                                banners={heroBelowBanners}
                                layout="horizontal"
                                mgidWidgetKey="home_hero_below"
                                linkClassName="w-full"
                                imageClassName="max-h-[200px] w-full object-cover"
                            />
                        </section>
                    )}

                    {/* Latest Articles + Trending Sidebar */}
                    <section className="w-full px-4 py-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                            {/* Latest Articles */}
                            <div className="lg:col-span-3">
                                <h2 className="mb-6 text-2xl font-bold text-gray-100">
                                    Berita Terbaru
                                </h2>

                                {/* First batch of articles */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {firstBatch.map((post) => (
                                        <ArticleCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Ad: Inline in feed */}
                                <AdSlot
                                    banners={feedInlineBanners}
                                    layout="inline"
                                    mgidWidgetKey="home_feed_inline"
                                    className="my-6"
                                />

                                {/* Rest of articles */}
                                {restBatch.length > 0 && (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {restBatch.map((post) => (
                                            <ArticleCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {(latestPosts.prev_page_url ||
                                    latestPosts.next_page_url) && (
                                        <div className="mt-8 flex items-center justify-between">
                                            {latestPosts.prev_page_url ? (
                                                <Link
                                                    href={latestPosts.prev_page_url}
                                                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                                                >
                                                    &larr; Previous
                                                </Link>
                                            ) : (
                                                <span />
                                            )}
                                            {latestPosts.next_page_url ? (
                                                <Link
                                                    href={latestPosts.next_page_url}
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

                            {/* Trending Sidebar */}
                            <aside>
                                <div className="sticky top-20 space-y-6">
                                    {/* Ad: Sidebar */}
                                    <AdSlot
                                        banners={sidebarBanners}
                                        layout="vertical"
                                        mgidWidgetKey="home_sidebar"
                                    />

                                    {/* Trending */}
                                    <div className="rounded-xl border border-gray-800 bg-[#1A1A1A] p-6">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-amber-500" />
                                            <h3 className="text-lg font-bold text-gray-100">
                                                Trending
                                            </h3>
                                        </div>
                                        <Separator className="my-4 bg-gray-800" />
                                        <ol className="flex flex-col gap-4">
                                            {trendingPosts.map((post, index) => (
                                                <li key={post.id}>
                                                    <Link
                                                        href={`/${post.slug}`}
                                                        className="group flex gap-3"
                                                    >
                                                        <span className="text-2xl font-extrabold text-amber-600/30">
                                                            {String(index + 1).padStart(
                                                                2,
                                                                '0',
                                                            )}
                                                        </span>
                                                        <div className="flex flex-col gap-1">
                                                            <h4 className="line-clamp-2 text-sm font-semibold text-gray-200 group-hover:text-amber-400">
                                                                {post.title}
                                                            </h4>
                                                            {post.category && (
                                                                <span className="text-xs text-gray-500">
                                                                    {post.category.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>

                    {/* ─── Category Sections ─── */}
                    {categoryPosts.length > 0 && (
                        <section className="w-full px-4 pb-10">
                            {categoryPosts.map((cat, catIndex) => (
                                <div key={cat.id}>
                                    {/* Section Header */}
                                    <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-3">
                                        <h2 className="text-xl font-bold text-gray-100">
                                            {cat.name}
                                        </h2>
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className="flex items-center gap-1 text-sm font-medium text-amber-500 hover:text-amber-400"
                                        >
                                            Lihat Semua
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    {/* Compact article list: first post as featured, rest as compact */}
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        {/* Left: Featured card for this category */}
                                        {cat.posts[0] && (
                                            <Link
                                                href={`/${cat.posts[0].slug}`}
                                                className="group relative overflow-hidden rounded-xl"
                                            >
                                                <div className="aspect-[16/10]">
                                                    {cat.posts[0].featured_image ? (
                                                        <img
                                                            src={
                                                                cat.posts[0]
                                                                    .featured_image
                                                            }
                                                            alt={cat.posts[0].title}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gray-800" />
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                                <div className="absolute bottom-0 flex flex-col gap-2 p-5">
                                                    <CategoryBadge
                                                        name={cat.name}
                                                        slug={cat.slug}
                                                        className="text-[10px]"
                                                    />
                                                    <h3 className="line-clamp-2 text-lg font-bold text-white group-hover:text-amber-300">
                                                        {cat.posts[0].title}
                                                    </h3>
                                                    <p className="text-xs text-white/70">
                                                        {cat.posts[0].author.name}{' '}
                                                        &middot;{' '}
                                                        {
                                                            cat.posts[0]
                                                                .published_at_human
                                                        }
                                                    </p>
                                                </div>
                                            </Link>
                                        )}

                                        {/* Right: Compact list */}
                                        <div className="flex flex-col gap-3">
                                            {cat.posts.slice(1).map((post) => (
                                                <CompactArticleCard
                                                    key={post.id}
                                                    post={post}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Spacer for last section */}
                                    {catIndex === categoryPosts.length - 1 && (
                                        <div className="mb-4" />
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                {/* Right Skin Banner */}
                {homeRightBanners && homeRightBanners.length > 0 && (
                    <aside className="hidden w-[160px] shrink-0 xl:block xl:w-[200px] 2xl:w-[300px]">
                        <div className="sticky top-24 pt-4">
                            <AdSlot
                                banners={homeRightBanners}
                                layout="vertical"
                                mgidWidgetKey="home_right_skin"
                            />
                        </div>
                    </aside>
                )}
            </div>

            {/* Global Popup Ad */}
            <AdPopup banners={popupBanners} />
        </PublicLayout>
    );
}
