import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ArticleCardSkeletonProps {
    className?: string;
}

/**
 * Full article card skeleton – matches ArticleCard layout.
 * Use in grids while data or images are loading.
 */
export function ArticleCardSkeleton({ className }: ArticleCardSkeletonProps) {
    return (
        <div
            className={cn(
                'flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#1A1A1A]',
                className,
            )}
        >
            {/* Image placeholder */}
            <Skeleton className="aspect-video w-full rounded-none" />

            {/* Content placeholder */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Category badge */}
                <Skeleton className="h-5 w-16 rounded-full" />
                {/* Title (2 lines) */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Excerpt (2 lines) */}
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
                {/* Author + date */}
                <div className="mt-auto flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    );
}

/**
 * Compact horizontal card skeleton – matches CompactArticleCard layout.
 */
export function CompactArticleCardSkeleton({
    className,
}: ArticleCardSkeletonProps) {
    return (
        <div
            className={cn(
                'flex gap-4 rounded-lg border border-gray-800/60 bg-[#1A1A1A] p-3',
                className,
            )}
        >
            {/* Thumbnail */}
            <Skeleton className="h-20 w-28 shrink-0 rounded-lg sm:h-24 sm:w-36" />

            {/* Text */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </div>
    );
}

/**
 * Hero card skeleton – matches the hero featured card.
 */
export function HeroCardSkeleton({ className }: ArticleCardSkeletonProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl',
                className,
            )}
        >
            <Skeleton className="aspect-[16/9] w-full rounded-none lg:aspect-auto lg:min-h-[420px]" />
            <div className="absolute bottom-0 flex w-full flex-col gap-3 p-6">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-4/5" />
                <Skeleton className="h-8 w-3/5" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}

/**
 * Small featured card skeleton – matches the 2x2 side feature cards.
 */
export function SmallFeatureCardSkeleton({
    className,
}: ArticleCardSkeletonProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl',
                className,
            )}
        >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="absolute bottom-0 flex w-full flex-col gap-1.5 p-3">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}
