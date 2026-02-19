import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    containerClassName?: string;
    fetchPriority?: 'high' | 'low' | 'auto';
    /**
     * If true, uses eager loading (for above-the-fold images).
     * If false, uses lazy + async decoding.
     */
    priority?: boolean;
}

/**
 * Image component with:
 * - Skeleton shimmer while loading
 * - Smooth fade-in on load
 * - Graceful fallback for missing images
 */
export default function LazyImage({
    src,
    alt,
    className = '',
    containerClassName = '',
    fetchPriority,
    priority = false,
}: LazyImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => setLoaded(true), []);
    const handleError = useCallback(() => {
        setLoaded(true);
        setError(true);
    }, []);

    if (!src || error) {
        return (
            <div
                className={cn(
                    'flex h-full w-full items-center justify-center bg-gray-800/60',
                    containerClassName,
                )}
            >
                <svg
                    className="h-8 w-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                </svg>
            </div>
        );
    }

    return (
        <div className={cn('relative h-full w-full', containerClassName)}>
            {/* Skeleton shimmer beneath the image */}
            {!loaded && (
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            )}

            <img
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={fetchPriority}
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    'h-full w-full object-cover transition-opacity duration-500',
                    loaded ? 'opacity-100' : 'opacity-0',
                    className,
                )}
            />
        </div>
    );
}
