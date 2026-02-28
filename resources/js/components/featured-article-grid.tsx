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
    author: { name: string };
    category: { name: string; slug: string } | null;
}

interface Props {
    title: string;
    articles: PostCard[];
}

export default function FeaturedArticleGrid({ title, articles }: Props) {
    if (!articles || articles.length === 0) return null;

    return (
        <section className="w-full px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                    {title}
                    <span className="text-amber-500">&rsaquo;</span>
                </h2>
                <Link href="#" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200">
                    <span className="hidden sm:inline">Lihat Semua</span>
                    <span className="text-amber-500">&rsaquo;</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((post) => (
                    <div
                        key={post.id}
                        className="group relative flex flex-col justify-end overflow-hidden rounded-xl bg-gray-900 min-h-[360px] sm:min-h-[420px] transition-transform hover:scale-[1.01]"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            {post.featured_image ? (
                                <img
                                    src={post.featured_image}
                                    alt={post.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-800" />
                            )}
                        </div>

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col gap-3 p-6 mt-auto w-full">
                            <h3 className="line-clamp-3 text-2xl font-bold text-white group-hover:text-amber-300 sm:text-3xl leading-tight">
                                {post.title}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-amber-500">
                                    {post.author.name.charAt(0)}
                                </span>
                                <span>{post.author.name}</span>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href={`/${post.slug}`}
                                    className="inline-flex rounded-md bg-amber-500/20 border border-amber-500/50 px-6 py-2.5 text-sm font-bold text-amber-500 transition-colors hover:bg-amber-500 hover:text-gray-950"
                                >
                                    Baca Selengkapnya
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
