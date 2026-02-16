import { cn } from '@/lib/utils';

type StatusVariant =
    | 'draft'
    | 'pending'
    | 'processing'
    | 'published'
    | 'completed'
    | 'rejected';

const statusStyles: Record<StatusVariant, string> = {
    draft: 'border-gray-200 bg-gray-50 text-gray-700',
    pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    processing: 'border-blue-200 bg-blue-50 text-blue-700',
    published: 'border-amber-200 bg-amber-50 text-amber-700',
    completed: 'border-amber-200 bg-amber-50 text-amber-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
};

const statusLabels: Record<StatusVariant, string> = {
    draft: 'Draft',
    pending: 'Pending',
    processing: 'Processing',
    published: 'Published',
    completed: 'Completed',
    rejected: 'Rejected',
};

interface StatusBadgeProps {
    status: StatusVariant;
    label?: string;
    className?: string;
}

export default function StatusBadge({
    status,
    label,
    className,
}: StatusBadgeProps) {
    const style = statusStyles[status] ?? statusStyles.draft;
    const text = label ?? statusLabels[status] ?? status;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
                style,
                className,
            )}
        >
            <span
                className={cn('size-1.5 rounded-full', {
                    'bg-gray-500': status === 'draft',
                    'bg-yellow-500': status === 'pending',
                    'bg-blue-500': status === 'processing',
                    'bg-amber-500':
                        status === 'published' || status === 'completed',
                    'bg-red-500': status === 'rejected',
                })}
            />
            {text}
        </span>
    );
}
