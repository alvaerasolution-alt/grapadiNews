import { Link, router, usePage } from '@inertiajs/react';
import { Menu, Search, X, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

const categories = [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/category/news' },
    { name: 'Business', href: '/category/business' },
    { name: 'Sport', href: '/category/sport' },
    { name: 'Tech', href: '/category/tech' },
    { name: 'Life', href: '/category/life' },
    { name: 'Health', href: '/category/health' },
    { name: 'Opinion', href: '/category/opinion' },
    { name: 'Education', href: '/category/education' },
];

interface SearchResult {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    published_at_human: string;
    category: { name: string; slug: string } | null;
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Debounced search
    const doSearch = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.trim().length < 2) {
            setResults([]);
            setHasSearched(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/search?q=${encodeURIComponent(q.trim())}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
                setHasSearched(true);
            }
        }, 300);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        doSearch(val);
    };

    const navigateToArticle = (slug: string) => {
        onClose();
        router.visit(`/article/${slug}`);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm">
            <div className="mx-auto max-w-2xl px-4 pt-4 sm:pt-20">
                <div className="overflow-hidden rounded-xl bg-[#1A1A1A] shadow-2xl ring-1 ring-white/10">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 border-b border-gray-700 px-4 py-3">
                        <Search className="h-5 w-5 shrink-0 text-amber-500" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleChange}
                            placeholder="Cari artikel..."
                            className="flex-1 bg-transparent text-base text-gray-100 placeholder-gray-500 outline-none"
                        />
                        {isLoading && (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />
                        )}
                        <button
                            onClick={onClose}
                            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {results.length > 0 ? (
                            <ul className="divide-y divide-gray-700/50">
                                {results.map((post) => (
                                    <li key={post.id}>
                                        <button
                                            onClick={() =>
                                                navigateToArticle(post.slug)
                                            }
                                            className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                                        >
                                            {post.featured_image && (
                                                <img
                                                    src={post.featured_image}
                                                    alt=""
                                                    className="h-14 w-20 shrink-0 rounded-md object-cover"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h4 className="line-clamp-1 text-sm font-semibold text-gray-100">
                                                    {post.title}
                                                </h4>
                                                {post.excerpt && (
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                    {post.category && (
                                                        <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-amber-400">
                                                            {post.category.name}
                                                        </span>
                                                    )}
                                                    <span>
                                                        {
                                                            post.published_at_human
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : hasSearched && query.trim().length >= 2 ? (
                            <div className="px-4 py-10 text-center text-sm text-gray-400">
                                Tidak ada artikel ditemukan untuk &ldquo;
                                {query}&rdquo;
                            </div>
                        ) : query.trim().length < 2 && query.length > 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-gray-500">
                                Ketik minimal 2 karakter untuk mencari...
                            </div>
                        ) : (
                            <div className="px-4 py-10 text-center text-sm text-gray-500">
                                Ketik untuk mencari artikel...
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="border-t border-gray-700 bg-[#151515] px-4 py-2 text-center text-xs text-gray-500">
                        Tekan{' '}
                        <kbd className="rounded border border-gray-600 bg-[#1A1A1A] px-1.5 py-0.5 font-mono text-xs">
                            Esc
                        </kbd>{' '}
                        untuk menutup
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PublicHeader() {
    const { auth } = usePage().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 10);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Global keyboard shortcut: Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <header
                className={`sticky top-0 z-50 w-full bg-[#111111] transition-shadow duration-200 ${
                    isScrolled ? 'shadow-lg shadow-black/30' : ''
                }`}
            >
                {/* Main navbar */}
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                    {/* Left: Mobile menu + Logo */}
                    <div className="flex items-center gap-2">
                        {/* Mobile hamburger */}
                        <div className="lg:hidden">
                            <Sheet
                                open={isMobileMenuOpen}
                                onOpenChange={setIsMobileMenuOpen}
                            >
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 text-gray-300 hover:bg-white/10 hover:text-white"
                                    >
                                        <Menu className="size-5" />
                                        <span className="sr-only">Menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-72 border-gray-800 bg-[#111111] p-0"
                                >
                                    <SheetTitle className="sr-only">
                                        Navigation Menu
                                    </SheetTitle>
                                    <div className="flex h-14 items-center border-b border-gray-800 px-4">
                                        <Link
                                            href="/"
                                            className="flex items-center gap-2"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <div className="flex size-8 items-center justify-center rounded-md bg-amber-600 text-white">
                                                <AppLogoIcon className="size-5 fill-current" />
                                            </div>
                                            <span className="text-lg font-bold text-amber-500">
                                                GrapadiNews
                                            </span>
                                        </Link>
                                    </div>
                                    <nav className="space-y-1 p-4">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.name}
                                                href={cat.href}
                                                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-amber-400"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="border-t border-gray-800 p-4">
                                        {auth.user ? (
                                            <Link
                                                href="/dashboard"
                                                className="block w-full rounded-md bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Link
                                                    href="/login"
                                                    className="flex-1 rounded-md border border-amber-600 px-4 py-2 text-center text-sm font-medium text-amber-500 hover:bg-amber-600/10"
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    href="/register"
                                                    className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700"
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Daftar
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-amber-600 text-white">
                                <AppLogoIcon className="size-5 fill-current" />
                            </div>
                            <span className="text-lg font-bold text-amber-500">
                                GrapadiNews
                            </span>
                        </Link>
                    </div>

                    {/* Center: Desktop category nav */}
                    <nav className="hidden lg:flex lg:items-center lg:gap-1">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-amber-400"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Search + Auth */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-gray-400 hover:bg-white/10 hover:text-amber-400"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="size-5" />
                            <span className="sr-only">Search</span>
                        </Button>

                        <div className="hidden sm:flex sm:items-center sm:gap-2">
                            {auth.user ? (
                                <Link href="/dashboard">
                                    <Button
                                        size="sm"
                                        className="bg-amber-600 text-white hover:bg-amber-700"
                                    >
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-300 hover:bg-white/10 hover:text-white"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button
                                            size="sm"
                                            className="bg-amber-600 text-white hover:bg-amber-700"
                                        >
                                            Daftar
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile category scroll strip */}
                <div className="border-t border-gray-800 lg:hidden">
                    <div
                        ref={categoryScrollRef}
                        className="scrollbar-none flex gap-1 overflow-x-auto px-4 py-2"
                    >
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-400 hover:bg-amber-600/20 hover:text-amber-400"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            {isSearchOpen && (
                <SearchOverlay onClose={() => setIsSearchOpen(false)} />
            )}
        </>
    );
}
