'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';

interface FlashData {
    success: string | null;
    error: string | null;
}

export function FlashToast() {
    const { flash } = usePage().props as { flash: FlashData };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return null;
}
