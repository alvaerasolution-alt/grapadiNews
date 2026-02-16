import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { BannerItem } from '@/components/ad-slot';

interface AdPopupProps {
    banners: BannerItem[];
}

const POPUP_SESSION_KEY = 'ad_popup_dismissed';

export default function AdPopup({ banners }: AdPopupProps) {
    const [visible, setVisible] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<BannerItem | null>(
        null,
    );

    useEffect(() => {
        if (!banners || banners.length === 0) return;

        const dismissed = sessionStorage.getItem(POPUP_SESSION_KEY);
        if (dismissed) return;

        // Show popup after a short delay for better UX
        const timer = setTimeout(() => {
            // Pick a random banner
            const randomIndex = Math.floor(Math.random() * banners.length);
            setCurrentBanner(banners[randomIndex]);
            setVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [banners]);

    const dismiss = useCallback(() => {
        setVisible(false);
        sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
    }, []);

    const handleClick = useCallback(
        async (banner: BannerItem) => {
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
                // silently fail
            }
            sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
            window.open(banner.url, '_blank', 'noopener,noreferrer');
            setVisible(false);
        },
        [],
    );

    if (!visible || !currentBanner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:bg-gray-100"
                    aria-label="Tutup iklan"
                >
                    <X className="h-4 w-4 text-gray-600" />
                </button>

                {/* Banner */}
                <button
                    onClick={() => handleClick(currentBanner)}
                    className="group block w-full overflow-hidden rounded-xl shadow-2xl transition-transform hover:scale-[1.01]"
                >
                    <img
                        src={`/storage/${currentBanner.image}`}
                        alt={currentBanner.title}
                        className="h-auto w-full object-cover"
                    />
                </button>

                {/* Dismiss text */}
                <p className="mt-2 text-center text-xs text-white/60">
                    Klik di luar atau tombol × untuk menutup
                </p>
            </div>
        </div>
    );
}
