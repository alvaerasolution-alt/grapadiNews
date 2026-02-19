import { useState, useEffect, type ReactNode } from 'react';
import { router } from '@inertiajs/react';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import CurrencyWidget from '@/components/currency-widget';
import { Toaster } from '@/components/toaster';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const [navigating, setNavigating] = useState(false);

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
            <CurrencyWidget />
            <PublicFooter />
            <Toaster />
        </div>
    );
}
