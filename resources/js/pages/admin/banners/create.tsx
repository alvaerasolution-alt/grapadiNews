import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

interface Position {
    value: string;
    label: string;
}

const RECOMMENDED_SIZES: Record<string, string> = {
    article_top: 'Rekomendasi: 728x90 (Desktop), 300x250 (Mobile)',
    article_bottom: 'Rekomendasi: 728x90 (Desktop), 300x250 (Mobile)',
    home_below_navbar: 'Rekomendasi: 970x90 atau 728x90 (Horizontal)',
    home_hero_below: 'Rekomendasi: 970x90 atau 728x90 (Horizontal)',
    home_sidebar: 'Rekomendasi: 300x250 atau 300x600 (Square/Vertical)',
    home_feed_inline: 'Rekomendasi: 728x90 (Desktop), 300x250 (Mobile)',
    home_left_skin: 'Rekomendasi: 160x600 atau 300x600 (Vertical/Skycraper)',
    home_right_skin: 'Rekomendasi: 160x600 atau 300x600 (Vertical/Skycraper)',
    category_top: 'Rekomendasi: 970x90 atau 728x90 (Horizontal)',
    category_sidebar: 'Rekomendasi: 300x250 atau 300x600 (Square/Vertical)',
    home_mid_section: 'Rekomendasi: 970x90 atau 728x90 (Horizontal)',
    global_popup: 'Rekomendasi: 300x250 atau 336x280 (Square)',
};

export default function AdminBannersCreate({
    positions,
}: {
    positions: Position[];
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        image: File | null;
        url: string;
        position: string;
        is_active: boolean;
        sort_order: number;
        starts_at: string;
        ends_at: string;
    }>({
        title: '',
        image: null,
        url: '',
        position: 'article_top',
        is_active: true,
        sort_order: 0,
        starts_at: '',
        ends_at: '',
    });

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    }

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/banners', { forceFormData: true });
    };

    return (
        <AppLayout>
            <Head title="Tambah Banner" />
            <div className="mx-auto max-w-3xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/banners"
                        className="rounded-lg border p-2 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-2xl font-bold">Tambah Banner</h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border bg-white p-6"
                >
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Judul</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Nama banner / campaign"
                        />
                        <InputError message={errors.title} />
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Gambar Banner</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <InputError message={errors.image} />
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-2 h-32 rounded-lg border object-cover"
                            />
                        )}
                    </div>

                    {/* URL */}
                    <div className="space-y-2">
                        <Label htmlFor="url">
                            URL Link <span className="text-xs text-gray-400">(opsional)</span>
                        </Label>
                        <Input
                            id="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://example.com"
                        />
                        <InputError message={errors.url} />
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Posisi Slot</Label>
                        <select
                            id="position"
                            value={data.position}
                            onChange={(e) =>
                                setData('position', e.target.value)
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {positions.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                            {RECOMMENDED_SIZES[data.position] || 'Pilih posisi banner'}
                        </p>
                        <InputError message={errors.position} />
                    </div>

                    {/* Scheduling */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="starts_at">
                                Mulai Tayang{' '}
                                <span className="text-xs text-gray-400">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData('starts_at', e.target.value)
                                }
                            />
                            <InputError message={errors.starts_at} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ends_at">
                                Berakhir{' '}
                                <span className="text-xs text-gray-400">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="ends_at"
                                type="datetime-local"
                                value={data.ends_at}
                                onChange={(e) =>
                                    setData('ends_at', e.target.value)
                                }
                            />
                            <InputError message={errors.ends_at} />
                        </div>
                    </div>

                    {/* Sort Order & Active */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Urutan</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData(
                                        'sort_order',
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                            />
                            <InputError message={errors.sort_order} />
                        </div>
                        <div className="flex items-end gap-2 pb-1">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', !!checked)
                                }
                            />
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Aktifkan banner
                            </Label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Banner'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
