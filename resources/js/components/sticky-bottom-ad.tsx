import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface StickyBottomAdProps {
    mgidWidgetKey?: string;
}

export default function StickyBottomAd({ mgidWidgetKey = 'home_hero_below' }: StickyBottomAdProps) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    const { mgidAds } = usePage<{
        mgidAds: {
            siteId: string | null;
            widgets: Record<string, string | null>;
        };
    }>().props;

    const siteId = mgidAds?.siteId;
    const widgetId = mgidAds?.widgets?.[mgidWidgetKey];

    // Don't show if no ad configured
    const hasAd = siteId && widgetId;

    // Show after scrolling 300px
    useEffect(() => {
        if (!hasAd) return;

        const handleScroll = () => {
            if (window.scrollY > 300 && !dismissed) {
                setVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [dismissed, hasAd]);

    // Init MGID widget when visible
    useEffect(() => {
        if (!visible || !hasAd || !containerRef.current || initialized.current) return;
        initialized.current = true;

        const widgetDiv = document.createElement('div');
        widgetDiv.setAttribute('data-type', '_mgwidget');
        widgetDiv.setAttribute('data-widget-id', widgetId!);
        containerRef.current.appendChild(widgetDiv);

        const w = window as any;
        w._mgq = w._mgq || [];
        w._mgq.push(['_mgc.load']);
    }, [visible, hasAd, widgetId]);

    const handleDismiss = () => {
        setVisible(false);
        setDismissed(true);
    };

    if (!hasAd || dismissed) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            {/* Shadow gradient for depth */}
            <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            <div className="border-t border-white/10 bg-[#0D0D0D]/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
                    {/* Label */}
                    <span className="shrink-0 rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                        Iklan
                    </span>

                    {/* Ad content */}
                    <div className="flex-1 overflow-hidden" style={{ maxHeight: '90px' }}>
                        <div ref={containerRef} className="overflow-hidden" style={{ maxHeight: '90px' }} />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 rounded-md p-1.5 text-gray-500 transition hover:bg-white/10 hover:text-white"
                        aria-label="Tutup iklan"
                        title="Tutup iklan"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
