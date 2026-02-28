import { Link } from '@inertiajs/react';
import {
    Search,
    Calendar,
    LayoutGrid,
    BarChart3,
    LineChart,
    Newspaper
} from 'lucide-react';

const TOP_NAV_ITEMS = [
    { name: 'Screener Saham', icon: Search, href: '#' },
    { name: 'Kalender Ekonomi', icon: Calendar, href: '#' },
    { name: 'Heatmap IHSG', icon: LayoutGrid, href: '#' },
    { name: 'Data Statistik', icon: BarChart3, href: '#' },
    { name: 'Tools Market', icon: LineChart, href: '#' },
    { name: 'Lihat Semua Berita', icon: Newspaper, href: '/category/nasional' }, // Link ke kategori yang ada misalnya
];

export default function TopStoriesNav() {
    return (
        <section className="w-full px-4 pt-4 pb-2">
            <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-none [mask-image:linear-gradient(to_right,white_90%,transparent)]">
                <h2 className="shrink-0 text-xl font-bold text-gray-100 lg:text-3xl">
                    Top Stories
                </h2>
                <div className="h-6 w-px bg-gray-800 shrink-0 hidden md:block" />
                <nav className="flex items-center gap-3 shrink-0">
                    {TOP_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-2 rounded-full border border-gray-800 bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <item.icon className="h-4 w-4 text-emerald-500" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </section>
    );
}
