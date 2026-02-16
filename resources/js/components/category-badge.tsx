import React from 'react';

const categoryColors: Record<string, string> = {
    news: 'bg-red-700 text-white',
    business: 'bg-blue-700 text-white',
    sport: 'bg-emerald-700 text-white',
    tech: 'bg-purple-700 text-white',
    life: 'bg-pink-700 text-white',
    health: 'bg-teal-700 text-white',
    opinion: 'bg-orange-700 text-white',
    education: 'bg-indigo-700 text-white',
};

const defaultColor = 'bg-amber-600 text-white';

interface CategoryBadgeProps {
    name: string;
    slug: string;
    className?: string;
}

export default function CategoryBadge({
    name,
    slug,
    className = '',
}: CategoryBadgeProps) {
    const color = categoryColors[slug] ?? defaultColor;

    return (
        <span
            className={`inline-block w-fit rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${color} ${className}`}
        >
            {name}
        </span>
    );
}
