import { useState, useEffect, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import StickyBottomAd from '@/components/sticky-bottom-ad';
import { Toaster } from '@/components/toaster';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function useAutoNotificationPrompt(vapidPublicKey: string) {
    useEffect(() => {
        if (
            !vapidPublicKey ||
            !('serviceWorker' in navigator) ||
            !('PushManager' in window) ||
            !('Notification' in window)
        ) {
            return;
        }

        // Only prompt if not yet decided
        if (Notification.permission !== 'default') {
            return;
        }

        // Delay prompt by 3 seconds for better UX
        const timer = setTimeout(async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    return;
                }

                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
                });

                const subJson = subscription.toJSON();
                await fetch('/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    },
                    body: JSON.stringify({
                        endpoint: subJson.endpoint,
                        keys: subJson.keys,
                        content_encoding: (subJson as { contentEncoding?: string }).contentEncoding ?? 'aesgcm',
                    }),
                });
            } catch {
                // Silently fail
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [vapidPublicKey]);
}

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { vapidPublicKey } = usePage<{ vapidPublicKey: string }>().props;
    const [navigating, setNavigating] = useState(false);

    useAutoNotificationPrompt(vapidPublicKey);

    useEffect(() => {
        const startHandler = () => setNavigating(true);
        const finishHandler = () => setNavigating(false);

        router.on('start', startHandler);
        router.on('finish', finishHandler);

        return () => {
            // Clean up is handled by Inertia's event system
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-[#0D0D0D] text-gray-100">
            <PublicHeader />
            <main className="flex-1 relative">
                {/* Page transition fade overlay */}
                {navigating && (
                    <div className="absolute inset-0 z-40 flex items-start justify-center bg-[#0D0D0D]/60 pt-32 backdrop-blur-[1px] transition-opacity">
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm text-gray-400">Memuat...</span>
                        </div>
                    </div>
                )}
                {children}
            </main>
            <PublicFooter />
            <Toaster />
            <StickyBottomAd mgidWidgetKey="home_hero_below" />
        </div>
    );
}
