import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    Calendar,
    ChevronRight,
    Eye,
    Heart,
    MessageCircle,
    Send,
    Trash2,
    User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { usePushNotification } from '@/hooks/use-push-notification';

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

interface CommentData {
    id: number;
    body: string;
    created_at_human: string;
    user: { id: number; name: string } | null;
    guest_name: string | null;
    commenter_name: string;
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
        likes_count: number;
        is_liked: boolean;
        comments_count: number;
        published_at: string;
        published_at_human: string;
        published_at_formatted: string;
        author: { name: string };
        category: { name: string; slug: string } | null;
        tags: { name: string; slug: string }[];
    };
    comments: CommentData[];
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

function LikeButton({
    slug,
    likesCount,
    isLiked,
}: {
    slug: string;
    likesCount: number;
    isLiked: boolean;
}) {
    const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
    const [optimisticCount, setOptimisticCount] = useState(likesCount);
    const [processing, setProcessing] = useState(false);

    function handleLike() {
        if (processing) {
            return;
        }

        setProcessing(true);
        setOptimisticLiked(!optimisticLiked);
        setOptimisticCount(optimisticLiked ? optimisticCount - 1 : optimisticCount + 1);

        router.post(`/posts/${slug}/like`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <button
            type="button"
            onClick={handleLike}
            className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${optimisticLiked
                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-400'
                }`}
            disabled={processing}
            id="like-button"
        >
            <Heart
                className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${optimisticLiked ? 'fill-current' : ''
                    }`}
            />
            <span>{optimisticCount}</span>
        </button>
    );
}

function NotificationBell() {
    const { vapidPublicKey } = usePage<{ vapidPublicKey: string }>().props;
    const pushNotif = usePushNotification(vapidPublicKey);

    if (!pushNotif.isSupported) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={pushNotif.isSubscribed ? pushNotif.unsubscribe : pushNotif.subscribe}
            className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${pushNotif.isSubscribed
                ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-amber-400'
                }`}
            disabled={pushNotif.loading}
            title={pushNotif.isSubscribed ? 'Nonaktifkan notifikasi' : 'Aktifkan notifikasi artikel baru'}
            id="notification-bell"
        >
            {pushNotif.isSubscribed ? (
                <BellOff className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            ) : (
                <Bell className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            )}
            <span className="hidden sm:inline">
                {pushNotif.loading
                    ? 'Memproses...'
                    : pushNotif.isSubscribed
                        ? 'Notifikasi Aktif'
                        : 'Notifikasi'}
            </span>
        </button>
    );
}

function CommentSection({
    postSlug,
    comments,
    commentsCount,
}: {
    postSlug: string;
    comments: CommentData[];
    commentsCount: number;
}) {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; roles: string[] } | null } }>().props;
    const user = auth.user;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post: submitComment, processing, reset, errors } = useForm({
        body: '',
        guest_name: '',
        guest_email: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        submitComment(`/posts/${postSlug}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    function handleDelete(commentId: number) {
        if (!confirm('Hapus komentar ini?')) {
            return;
        }
        router.delete(`/comments/${commentId}`, {
            preserveScroll: true,
        });
    }

    const isAdmin = user?.roles?.includes('admin');

    return (
        <div className="mt-6">
            <Separator className="mb-5 bg-gray-800" />
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200">
                    <MessageCircle className="h-5 w-5" />
                    Komentar ({commentsCount})
                </h3>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${showForm
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-amber-500 text-gray-900 hover:bg-amber-400'
                        }`}
                    id="toggle-comment-form"
                >
                    <MessageCircle className="h-4 w-4" />
                    {showForm ? 'Batal' : 'Tulis Komentar'}
                </button>
            </div>

            {/* Comment Form — toggled */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                            {user ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 space-y-2">
                            {/* Guest fields */}
                            {!user && (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <div>
                                        <input
                                            type="text"
                                            value={data.guest_name}
                                            onChange={(e) => setData('guest_name', e.target.value)}
                                            placeholder="Nama *"
                                            maxLength={100}
                                            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                            id="guest-name"
                                        />
                                        {errors.guest_name && (
                                            <p className="mt-1 text-xs text-red-400">{errors.guest_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            value={data.guest_email}
                                            onChange={(e) => setData('guest_email', e.target.value)}
                                            placeholder="Email *"
                                            maxLength={255}
                                            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                            id="guest-email"
                                        />
                                        {errors.guest_email && (
                                            <p className="mt-1 text-xs text-red-400">{errors.guest_email}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder="Tulis komentar..."
                                rows={3}
                                maxLength={1000}
                                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                id="comment-textarea"
                            />
                            {errors.body && (
                                <p className="mt-1 text-xs text-red-400">{errors.body}</p>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {data.body.length}/1000
                                </span>
                                <button
                                    type="submit"
                                    disabled={processing || !data.body.trim() || (!user && (!data.guest_name.trim() || !data.guest_email.trim()))}
                                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    id="submit-comment"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {processing ? 'Mengirim...' : 'Kirim'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Comment List */}
            {comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group flex gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:border-gray-700"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-gray-300">
                                {comment.commenter_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-200">
                                        {comment.commenter_name}
                                    </span>
                                    {!comment.user && (
                                        <span className="rounded-full bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">Tamu</span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {comment.created_at_human}
                                    </span>
                                    {(user && (user.id === comment.user?.id || isAdmin)) && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(comment.id)}
                                            className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                                            title="Hapus komentar"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-400" />
                                        </button>
                                    )}
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap break-words">
                                    {comment.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-gray-500">
                    Belum ada komentar. Jadilah yang pertama!
                </p>
            )}
        </div>
    );
}

export default function PostShow({
    post,
    comments,
    relatedPosts,
    trendingPosts,
    popularPosts,
    topBanners,
    bottomBanners,
    sidebarBanners,
}: Props) {
    const { name, auth } = usePage<{ name: string; auth: { user: { id: number } | null } }>().props;
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

                        {/* Like & Notification */}
                        <Separator className="mb-5 bg-gray-800" />
                        <div className="flex flex-wrap items-center gap-3">
                            <LikeButton
                                slug={post.slug}
                                likesCount={post.likes_count}
                                isLiked={post.is_liked}
                            />
                            <NotificationBell />
                        </div>

                        {/* Comments Section */}
                        <CommentSection
                            postSlug={post.slug}
                            comments={comments}
                            commentsCount={post.comments_count}
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
