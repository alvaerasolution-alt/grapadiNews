import { useState, useEffect, useCallback } from 'react';

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

interface UsePushNotificationReturn {
    isSupported: boolean;
    isSubscribed: boolean;
    permission: NotificationPermission | 'unsupported';
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
    loading: boolean;
}

export function usePushNotification(vapidPublicKey: string): UsePushNotificationReturn {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        setIsSupported(true);
        setPermission(Notification.permission);

        // Check existing subscription
        navigator.serviceWorker.ready.then((registration) => {
            registration.pushManager.getSubscription().then((sub) => {
                setIsSubscribed(!!sub);
            });
        });
    }, []);

    const subscribe = useCallback(async () => {
        if (!isSupported || loading) {
            return;
        }

        setLoading(true);

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                setLoading(false);
                return;
            }

            // Register service worker if not already
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
            });

            const subJson = subscription.toJSON();

            // Send to backend
            await fetch('/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({
                    endpoint: subJson.endpoint,
                    keys: subJson.keys,
                    content_encoding:
                        (subJson as { contentEncoding?: string }).contentEncoding ?? 'aesgcm',
                }),
            });

            setIsSubscribed(true);
        } catch (error) {
            console.error('Failed to subscribe:', error);
        } finally {
            setLoading(false);
        }
    }, [isSupported, loading, vapidPublicKey]);

    const unsubscribe = useCallback(async () => {
        if (!isSupported || loading) {
            return;
        }

        setLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await fetch('/push/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                    }),
                });

                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
        } finally {
            setLoading(false);
        }
    }, [isSupported, loading]);

    return {
        isSupported,
        isSubscribed,
        permission,
        subscribe,
        unsubscribe,
        loading,
    };
}
