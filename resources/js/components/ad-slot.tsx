import { useCallback } from 'react';
import MgidAdUnit from '@/components/mgid-ad-unit';

export interface BannerItem {
    id: number;
    title: string;
    image: string;
    url: string;
}

interface AdSlotProps {
    banners: BannerItem[];
    layout?: 'horizontal' | 'vertical' | 'inline';
    mgidWidgetKey?: string;
    className?: string;
    linkClassName?: string;
    imageClassName?: string;
}

export default function AdSlot({
    banners,
    layout = 'horizontal',
    mgidWidgetKey,
    className = '',
    linkClassName = '',
    imageClassName = '',
}: AdSlotProps) {
    const handleClick = useCallback(
        async (banner: BannerItem, e: React.MouseEvent) => {
            e.preventDefault();
            try {
                await fetch(`/banners/${banner.id}/click`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                        Accept: 'application/json',
                    },
                });
            } catch {
                // silently fail click tracking
            }
            window.open(banner.url, '_blank', 'noopener,noreferrer');
        },
        [],
    );

    const hasManualBanners = banners && banners.length > 0;

    // Nothing to show at all
    if (!hasManualBanners && !mgidWidgetKey) return null;

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {/* Manual banners */}
            {hasManualBanners && (
                <>
                    {layout === 'vertical' &&
                        banners.map((banner) => (
                            <a
                                key={banner.id}
                                href={banner.url}
                                onClick={(e) => handleClick(banner, e)}
                                className="group block overflow-hidden rounded-xl border border-gray-800 transition-shadow hover:shadow-md"
                                aria-label={`Ad: ${banner.title}`}
                            >
                                <img
                                    src={`/storage/${banner.image}`}
                                    alt={banner.title}
                                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    loading="lazy"
                                />
                            </a>
                        ))}

                    {layout === 'inline' && (
                        <div className="overflow-hidden rounded-xl border border-dashed border-gray-700 bg-[#1A1A1A]">
                            {banners.map((banner) => (
                                <a
                                    key={banner.id}
                                    href={banner.url}
                                    onClick={(e) => handleClick(banner, e)}
                                    className="group block"
                                    aria-label={`Ad: ${banner.title}`}
                                >
                                    <img
                                        src={`/storage/${banner.image}`}
                                        alt={banner.title}
                                        className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                                        loading="lazy"
                                    />
                                </a>
                            ))}
                        </div>
                    )}

                    {layout === 'horizontal' &&
                        banners.map((banner) => (
                            <a
                                key={banner.id}
                                href={banner.url}
                                onClick={(e) => handleClick(banner, e)}
                                className={`group block overflow-hidden rounded-xl transition-shadow hover:shadow-lg ${linkClassName}`}
                                aria-label={`Ad: ${banner.title}`}
                            >
                                <img
                                    src={`/storage/${banner.image}`}
                                    alt={banner.title}
                                    className={`h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${imageClassName}`}
                                    loading="lazy"
                                />
                            </a>
                        ))}
                </>
            )}

            {/* MGID Ad Unit */}
            {mgidWidgetKey && (
                <MgidAdUnit widgetKey={mgidWidgetKey} />
            )}
        </div>
    );
}
