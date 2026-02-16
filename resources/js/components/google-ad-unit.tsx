import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

interface GoogleAdUnitProps {
    slotKey: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: Record<string, unknown>[];
    }
}

export default function GoogleAdUnit({
    slotKey,
    format = 'auto',
    responsive = true,
    className = '',
}: GoogleAdUnitProps) {
    const { googleAds } = usePage<{
        googleAds: {
            publisherId: string | null;
            slots: Record<string, string | null>;
        };
    }>().props;

    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);

    const publisherId = googleAds?.publisherId;
    const slotId = googleAds?.slots?.[slotKey];

    useEffect(() => {
        if (!publisherId || !slotId || pushed.current) return;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch {
            // AdSense not loaded yet or ad blocker active
        }
    }, [publisherId, slotId]);

    if (!publisherId || !slotId) return null;

    return (
        <div className={`google-ad-unit ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={publisherId}
                data-ad-slot={slotId}
                data-ad-format={format}
                {...(responsive && { 'data-full-width-responsive': 'true' })}
            />
        </div>
    );
}
