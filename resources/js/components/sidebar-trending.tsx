import { Link } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

interface TrendingPost {
    id: number;
    title: string;
    slug: string;
    view_count: number;
    category: { name: string; slug: string } | null;
}

interface SidebarTrendingProps {
    posts: TrendingPost[];
}

export default function SidebarTrending({ posts }: SidebarTrendingProps) {
    if (posts.length === 0) return null;

    return (
        <div className="rounded-xl border border-gray-800 bg-[#1A1A1A] p-5">
            <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-gray-100">
                    Trending Topics
                </h3>
            </div>
            <ol className="flex flex-col gap-3">
                {posts.map((post, index) => (
                    <li key={post.id}>
                        <Link
                            href={`/article/${post.slug}`}
                            className="group flex gap-3"
                        >
                            <span className="text-xl font-extrabold leading-tight text-amber-600/30">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
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
    );
}
