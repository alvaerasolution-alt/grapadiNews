import { Head, Link, router, usePage } from '@inertiajs/react';
import { ExternalLink, MousePointerClick, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

interface Banner {
    id: number;
    title: string;
    image: string;
    url: string;
    position: string;
    is_active: boolean;
    sort_order: number;
    starts_at: string | null;
    ends_at: string | null;
    click_count: number;
}

interface Position {
    value: string;
    label: string;
}

interface PaginatedBanners {
    data: Banner[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

function getPositionLabel(
    value: string,
    positions: Position[],
): string {
    return positions.find((p) => p.value === value)?.label || value;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminBannersIndex({
    banners,
    positions,
}: {
    banners: PaginatedBanners;
    positions: Position[];
}) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;

    function handleDelete(id: number) {
        if (confirm('Yakin ingin menghapus banner ini?')) {
            router.delete(`/admin/banners/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Manajemen Banner" />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Manajemen Iklan / Banner
                    </h1>
                    <Link href="/admin/banners/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Banner
                        </Button>
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[580px] text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    <th className="p-4">Preview</th>
                                    <th className="p-4">Banner</th>
                                    <th className="p-4">Slot</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Jadwal</th>
                                    <th className="p-4">
                                        <MousePointerClick className="h-3.5 w-3.5" />
                                    </th>
                                    <th className="p-4">#</th>
                                    <th className="p-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {banners.data.map((banner) => (
                                    <tr
                                        key={banner.id}
                                        className="hover:bg-gray-50/50"
                                    >
                                        <td className="p-4 align-middle">
                                            <img
                                                src={`/storage/${banner.image}`}
                                                alt={banner.title}
                                                className="h-12 w-24 rounded object-cover"
                                            />
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">
                                                {banner.title}
                                            </div>
                                            <a
                                                href={banner.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-700"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {banner.url.length > 35
                                                    ? `${banner.url.substring(0, 35)}...`
                                                    : banner.url}
                                            </a>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                {getPositionLabel(
                                                    banner.position,
                                                    positions,
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${banner.is_active
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {banner.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-xs text-muted-foreground">
                                            <div>
                                                {banner.starts_at
                                                    ? `Mulai: ${formatDate(banner.starts_at)}`
                                                    : 'Mulai: —'}
                                            </div>
                                            <div>
                                                {banner.ends_at
                                                    ? `Akhir: ${formatDate(banner.ends_at)}`
                                                    : 'Akhir: —'}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-mono text-sm text-muted-foreground">
                                            {banner.click_count.toLocaleString()}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {banner.sort_order}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/admin/banners/${banner.id}/edit`}
                                                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-700"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(banner.id)
                                                    }
                                                    className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {banners.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="p-8 text-center text-gray-400"
                                        >
                                            Belum ada banner. Klik "Tambah
                                            Banner" untuk memulai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {(banners.prev_page_url || banners.next_page_url) && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            {banners.prev_page_url ? (
                                <Link
                                    href={banners.prev_page_url}
                                    className="text-sm text-gray-600 hover:text-amber-700"
                                >
                                    &larr; Sebelumnya
                                </Link>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-gray-400">
                                Halaman {banners.current_page} dari{' '}
                                {banners.last_page}
                            </span>
                            {banners.next_page_url ? (
                                <Link
                                    href={banners.next_page_url}
                                    className="text-sm text-gray-600 hover:text-amber-700"
                                >
                                    Selanjutnya &rarr;
                                </Link>
                            ) : (
                                <span />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
