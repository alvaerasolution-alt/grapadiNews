import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import CategoryBadge from './category-badge';
import LazyImage from './lazy-image';
import { fetchMarketData } from './market-overview';

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

interface StockQuote {
    code: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
    volume: number;
    isUp: boolean;
}

interface Props {
    sideArticles: PostCard[];
    bottomArticles: PostCard[];
    leftArticles?: PostCard[];
}

const STOCKS_PER_PAGE = 4;

function formatVolume(vol: number): string {
    if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1).replace('.', ',') + ' B';
    if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1).replace('.', ',') + ' M';
    if (vol >= 1_000) return (vol / 1_000).toFixed(1).replace('.', ',') + ' K';
    return vol.toLocaleString('id-ID');
}

export default function MarketDashboard({ sideArticles, bottomArticles, leftArticles = [] }: Props) {
    const [stocks, setStocks] = useState<StockQuote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [fading, setFading] = useState(false);
    const isHovering = useRef(false);

    const totalPages = useMemo(() => Math.ceil(stocks.length / STOCKS_PER_PAGE), [stocks]);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await fetchMarketData();
                setStocks(data.stocks);
            } catch {
                // Will show fallback if already loaded, or empty
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (totalPages <= 1) return;
        const interval = setInterval(() => {
            if (!isHovering.current) {
                setFading(true);
                setTimeout(() => {
                    setPage((prev) => (prev + 1) % totalPages);
                    setFading(false);
                }, 300);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [totalPages]);

    const visibleStocks = stocks.slice(
        page * STOCKS_PER_PAGE,
        page * STOCKS_PER_PAGE + STOCKS_PER_PAGE
    );

    return (
        <section className="w-full px-4 py-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                    Market Dashboard
                    <span className="text-amber-500">&rsaquo;</span>
                </h2>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-400">
                    LIVE
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left column: Stock Table + Articles */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* Stock Table */}
                    <div
                        className="flex flex-col rounded-xl border border-gray-800 bg-[#1A1A1A] overflow-hidden"
                        onMouseEnter={() => { isHovering.current = true; }}
                        onMouseLeave={() => { isHovering.current = false; }}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                            <div className="flex items-center gap-4">
                                <h3 className="text-base font-bold text-gray-100">Ringkasan Saham IHSG</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-400 border border-gray-700 rounded px-2 py-0.5">
                                    <div className="w-2 h-2 rounded-sm bg-emerald-500 animate-pulse" />
                                    <span>Live Market Data</span>
                                </div>
                            </div>
                            {/* Page dots */}
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setFading(true); setTimeout(() => { setPage(i); setFading(false); }, 200); }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? 'w-4 bg-amber-500' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Text-based Stock Table */}
                        <div className="px-4 py-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-800/60 text-xs font-medium text-gray-500">
                                <span>Kode Saham</span>
                                <span className="text-right">Harga</span>
                                <span className="text-right">Perubahan</span>
                                <span className="text-right">Volume</span>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col gap-1 py-2">
                                    {[...Array(STOCKS_PER_PAGE)].map((_, i) => (
                                        <div key={i} className="h-10 animate-pulse rounded bg-gray-700/40" />
                                    ))}
                                </div>
                            ) : (
                                <div className={`transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
                                    {visibleStocks.map((stock) => (
                                        <div
                                            key={stock.code}
                                            className="grid grid-cols-4 gap-4 py-2 border-b border-gray-800/30 items-center hover:bg-white/5 transition-colors"
                                        >
                                            <div>
                                                <span className="text-sm font-bold text-gray-100">{stock.code}</span>
                                                <span className="block text-[11px] text-gray-500 truncate">{stock.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-200 text-right">{stock.price.toLocaleString('id-ID')}</span>
                                            <div className="text-right">
                                                <span className={`text-sm font-semibold ${stock.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {stock.isUp ? '+' : ''}{stock.change.toFixed(0)}
                                                </span>
                                                <span className={`block text-[11px] ${stock.isUp ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                                    {stock.isUp ? '+' : ''}{stock.changePct.toFixed(2)}%
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 text-right">{formatVolume(stock.volume)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Articles below stock table */}
                    {leftArticles.length > 0 && leftArticles.map((post) => (
                        <Link
                            key={post.id}
                            href={`/${post.slug}`}
                            className="group flex gap-4 rounded-xl border border-gray-800/60 bg-[#1A1A1A] p-3 transition-colors hover:bg-white/5"
                        >
                            <div className="w-24 h-16 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                                <LazyImage
                                    src={post.featured_image}
                                    alt={post.title}
                                    className="transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                                {post.category && (
                                    <span className="text-[11px] text-gray-500">
                                        {post.category.name}
                                    </span>
                                )}
                                <h4 className="line-clamp-2 text-sm font-bold text-gray-200 group-hover:text-amber-400 leading-snug">
                                    {post.title}
                                </h4>
                                <span className="text-[11px] text-gray-500">{post.published_at_human}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Right side: 2 vertically stacked articles */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                        <h3 className="text-base font-bold text-gray-100">Market Terpopuler</h3>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                        {sideArticles.map((post) => (
                            <Link
                                key={post.id}
                                href={`/${post.slug}`}
                                className="group flex flex-col xs:flex-row lg:flex-col gap-4 rounded-xl border border-gray-800/60 bg-[#1A1A1A] p-3 transition-colors hover:bg-white/5 h-full"
                            >
                                <div className="w-full xs:w-1/3 lg:w-full aspect-video shrink-0 overflow-hidden rounded-lg bg-gray-800">
                                    <LazyImage
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                                    {post.category && (
                                        <span className="text-xs text-gray-500">
                                            {post.category.name} | {post.view_count.toLocaleString()} Views
                                        </span>
                                    )}
                                    <h4 className="line-clamp-3 text-base font-bold text-gray-200 group-hover:text-amber-400 leading-snug">
                                        {post.title}
                                    </h4>
                                    <div className="mt-auto flex items-center gap-2 text-xs text-gray-500">
                                        <span className="opacity-70">&copy;</span>
                                        <span>{post.published_at_human}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
