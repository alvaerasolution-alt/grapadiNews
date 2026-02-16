import type { ReactNode } from 'react';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[#0D0D0D] text-gray-100">
            <PublicHeader />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
