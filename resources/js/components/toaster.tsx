'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { FlashToast } from './flash-toast';

export function Toaster() {
    return (
        <>
            <SonnerToaster
                position="top-right"
                richColors
                toastOptions={{
                    style: {
                        background: '#1A1A1A',
                        border: '1px solid #333',
                        color: '#fff',
                    },
                }}
            />
            <FlashToast />
        </>
    );
}
