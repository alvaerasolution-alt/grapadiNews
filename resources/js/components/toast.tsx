'use client';

import { toast as sonner } from 'sonner';

export function toast(
    message: string,
    options?: { type?: 'success' | 'error' | 'info'; description?: string },
) {
    const { type = 'success', description } = options || {};

    switch (type) {
        case 'success':
            sonner.success(message, { description });
            break;
        case 'error':
            sonner.error(message, { description });
            break;
        case 'info':
            sonner.info(message, { description });
            break;
        default:
            sonner(message, { description });
    }
}

export function toastSuccess(message: string, description?: string) {
    sonner.success(message, { description });
}

export function toastError(message: string, description?: string) {
    sonner.error(message, { description });
}

export function toastInfo(message: string, description?: string) {
    sonner.info(message, { description });
}
