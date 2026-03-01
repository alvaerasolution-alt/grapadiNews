import { Link } from '@inertiajs/react';
import LazyImage from './lazy-image';

interface PostCard {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    view_count: number;
    published_at: string;
    published_at_human: string;
    author: { name: string; profile_photo?: string | null; bio?: string | null };
    category: { name: string; slug: string } | null;
}

interface Props {
    title: string;
    articles: PostCard[];
}

export default function HorizontalArticleList({ title, articles }: Props) {
    if (!articles || articles.length === 0) return null;

    return (
        <section className="w-full px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                    {title}
                    <span className="text-amber-500">&rsaquo;</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((post) => (
                    <Link
                        key={post.id}
                        href={`/${post.slug}`}
                        className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#1A1A1A] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50"
                    >
                        <div className="aspect-[2/1] w-full overflow-hidden bg-gray-800">
                            <LazyImage
                                src={post.featured_image}
                                alt={post.title}
                                className="transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        {/* Orange overlay gradient from bottom */}
                        <div className="absolute inset-x-0 top-1/2 bottom-0 bg-gradient-to-t from-gray-900/90 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-1 flex-col p-5">
                            <div className="mb-2">
                                <span className="rounded bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                    {post.category?.name || 'News'}
                                </span>
                            </div>
                            <h3 className="line-clamp-2 text-lg font-bold text-gray-100 group-hover:text-amber-400 mb-2">
                                {post.title}
                            </h3>
                            <p className="line-clamp-2 text-sm text-gray-400 mb-4">
                                {post.excerpt}
                            </p>
                            <div className="mt-auto flex items-center text-xs text-gray-500">
                                <span>{post.published_at_human}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
