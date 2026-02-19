import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

interface MgidAdUnitProps {
    widgetKey: string;
    className?: string;
}

export default function MgidAdUnit({
    widgetKey,
    className = '',
}: MgidAdUnitProps) {
    const { mgidAds } = usePage<{
        mgidAds: {
            siteId: string | null;
            widgets: Record<string, string | null>;
        };
    }>().props;

    const containerRef = useRef<HTMLDivElement>(null);

    const siteId = mgidAds?.siteId;
    const widgetId = mgidAds?.widgets?.[widgetKey];

    useEffect(() => {
        if (!siteId || !widgetId || !containerRef.current) return;

        // MGID widgets are initialized automatically by the global script
        // when it finds a container with the matching id
        const existingScript = document.getElementById(`mgid-script-${widgetId}`);
        if (existingScript) return;

        const script = document.createElement('script');
        script.id = `mgid-script-${widgetId}`;
        script.src = `https://jsc.mgid.com/g/${siteId.charAt(0)}/${siteId}.js`;
        script.async = true;
        containerRef.current.appendChild(script);
    }, [siteId, widgetId]);

    if (!siteId || !widgetId) return null;

    return (
        <div className={`mgid-ad-unit ${className}`}>
            <div
                ref={containerRef}
                id={`M${widgetId}`}
            />
        </div>
    );
}
