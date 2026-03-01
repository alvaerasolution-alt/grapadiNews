import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

interface MgidAdUnitProps {
    widgetKey: string;
    className?: string;
    fullHeight?: boolean;
}

export default function MgidAdUnit({
    widgetKey,
    className = '',
    fullHeight = false,
}: MgidAdUnitProps) {
    const { mgidAds } = usePage<{
        mgidAds: {
            siteId: string | null;
            widgets: Record<string, string | null>;
        };
    }>().props;

    const containerRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    const siteId = mgidAds?.siteId;
    const widgetId = mgidAds?.widgets?.[widgetKey];

    useEffect(() => {
        if (!siteId || !widgetId || !containerRef.current || initialized.current) return;
        initialized.current = true;

        // Exact MGID installation code: container div + _mgq queue push
        const widgetDiv = document.createElement('div');
        widgetDiv.setAttribute('data-type', '_mgwidget');
        widgetDiv.setAttribute('data-widget-id', widgetId);
        containerRef.current.appendChild(widgetDiv);

        // Trigger MGID to scan for new widgets
        const w = window as any;
        w._mgq = w._mgq || [];
        w._mgq.push(['_mgc.load']);
    }, [siteId, widgetId]);

    if (!siteId || !widgetId) return null;

    const heightStyle = fullHeight ? {} : { maxHeight: '420px' };

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`} style={heightStyle}>
            <div
                ref={containerRef}
                className="overflow-hidden"
                style={heightStyle}
            />
        </div>
    );
}
