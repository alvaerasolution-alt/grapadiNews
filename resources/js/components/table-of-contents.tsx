import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    htmlContent: string;
    isDark?: boolean;
}

/**
 * Parse headings (h2, h3, h4) from an HTML string.
 * Returns a list of TocItem with generated IDs.
 */
function parseHeadings(html: string): TocItem[] {
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h2, h3, h4');
    const items: TocItem[] = [];
    const usedIds = new Set<string>();

    headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        if (!text) return;

        let id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 60);

        // Ensure unique IDs
        let uniqueId = id;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
        }
        usedIds.add(uniqueId);

        items.push({
            id: uniqueId,
            text,
            level: parseInt(heading.tagName.charAt(1)),
        });
    });

    return items;
}

/**
 * Inject `id` attributes into headings of an HTML string.
 * Each heading gets an ID that matches the TocItem list.
 */
export function injectHeadingIds(html: string): string {
    if (typeof window === 'undefined') return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h2, h3, h4');
    const usedIds = new Set<string>();

    headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        if (!text) return;

        let id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 60);

        let uniqueId = id;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
        }
        usedIds.add(uniqueId);

        heading.setAttribute('id', uniqueId);
    });

    return doc.body.innerHTML;
}

export default function TableOfContents({
    htmlContent,
    isDark = false,
}: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const items = useMemo(() => parseHeadings(htmlContent), [htmlContent]);

    // Observe headings for active state
    useEffect(() => {
        if (items.length === 0) return;

        // Small delay to ensure headings are rendered in DOM
        const timeout = setTimeout(() => {
            observerRef.current?.disconnect();

            const callback: IntersectionObserverCallback = (entries) => {
                // Find the first visible entry
                const visibleEntries = entries.filter(
                    (e) => e.isIntersecting,
                );
                if (visibleEntries.length > 0) {
                    setActiveId(visibleEntries[0].target.id);
                }
            };

            observerRef.current = new IntersectionObserver(callback, {
                rootMargin: '-80px 0px -60% 0px',
                threshold: 0.1,
            });

            items.forEach((item) => {
                const el = document.getElementById(item.id);
                if (el) {
                    observerRef.current?.observe(el);
                }
            });
        }, 200);

        return () => {
            clearTimeout(timeout);
            observerRef.current?.disconnect();
        };
    }, [items]);

    const scrollToHeading = useCallback(
        (id: string) => {
            const el = document.getElementById(id);
            if (el) {
                const offset = 80; // Account for sticky header
                const top =
                    el.getBoundingClientRect().top +
                    window.scrollY -
                    offset;
                window.scrollTo({ top, behavior: 'smooth' });
                setActiveId(id);
                setIsExpanded(false); // collapse on mobile after click
            }
        },
        [],
    );

    if (items.length < 2) return null;

    const minLevel = Math.min(...items.map((i) => i.level));

    const tocList = (
        <nav aria-label="Table of contents">
            <ul className="space-y-0.5">
                {items.map((item) => {
                    const indent = (item.level - minLevel) * 12;
                    const isActive = activeId === item.id;

                    return (
                        <li key={item.id}>
                            <button
                                onClick={() => scrollToHeading(item.id)}
                                className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-all duration-200 ${isActive
                                    ? 'bg-amber-900/40 font-semibold text-amber-400'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    }`}
                                style={{ paddingLeft: `${12 + indent}px` }}
                            >
                                <span className="line-clamp-2">
                                    {item.text}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );

    return (
        <>
            {/* Desktop: rendered as a simple card (parent controls sticky/layout) */}
            <div
                className="hidden overflow-y-auto rounded-xl border border-gray-800 bg-[#1A1A1A] p-4 lg:block"
            >
                <h2
                    className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"
                >
                    <List className="h-3.5 w-3.5" />
                    Daftar Isi
                </h2>
                {tocList}
            </div>

            {/* Mobile: Collapsible panel */}
            <div
                className="mb-6 overflow-hidden rounded-xl border border-gray-800 bg-[#1A1A1A] lg:hidden"
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-gray-300 hover:bg-white/5"
                >
                    <span className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Daftar Isi ({items.length})
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {isExpanded && <div className="px-2 pb-3">{tocList}</div>}
            </div>
        </>
    );
}
