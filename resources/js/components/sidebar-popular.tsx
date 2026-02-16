import { Link } from '@inertiajs/react';
import { Flame } from 'lucide-react';

interface PostCard {
    id: number;
    title: string;
    slug: string;
    featured_image: string | null;
    published_at_human: string;
    category: { name: string; slug: string } | null;
}

interface SidebarPopularProps {
    posts: PostCard[];
}

export default function SidebarPopular({ posts }: SidebarPopularProps) {
    if (posts.length === 0) return null;

    return (
        <div className="rounded-xl border border-gray-800 bg-[#1A1A1A] p-5">
            <div className="mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="text-base font-bold text-gray-100">
                    Berita Terpopuler
                </h3>
            </div>
            <div className="flex flex-col gap-3">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/article/${post.slug}`}
                        className="group flex gap-3"
                    >
                        {post.featured_image ? (
                            <img
                                src={post.featured_image}
                                alt=""
                                className="h-16 w-20 shrink-0 rounded-lg object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-16 w-20 shrink-0 rounded-lg bg-gray-800" />
                        )}
                        <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-semibold text-gray-200 group-hover:text-amber-400">
                                {post.title}
                            </h4>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                {post.category && (
                                    <>
                                        <span>{post.category.name}</span>
                                        <span>&middot;</span>
                                    </>
                                )}
                                <span>{post.published_at_human}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
