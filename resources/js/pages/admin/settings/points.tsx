import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { Award, Eye, Repeat, Save, Wallet } from 'lucide-react';

interface PointSettings {
    publish_points_enabled: boolean;
    points_per_publish: number;
    view_points_enabled: boolean;
    views_per_point: number;
    max_points_per_article: number;
    rupiah_per_point: number;
    max_pending_requests: number;
    redemption_cooldown_hours: number;
}

interface Props {
    settings: PointSettings;
}

export default function PointSettingsPage({ settings }: Props) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        publish_points_enabled: settings.publish_points_enabled,
        points_per_publish: settings.points_per_publish,
        view_points_enabled: settings.view_points_enabled,
        views_per_point: settings.views_per_point,
        max_points_per_article: settings.max_points_per_article,
        rupiah_per_point: settings.rupiah_per_point,
        max_pending_requests: settings.max_pending_requests,
        redemption_cooldown_hours: settings.redemption_cooldown_hours,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/settings/points');
    };

    const formatRupiah = (value: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout>
            <Head title="Point Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Settings</h1>

                <div className="mb-6 border-b">
                    <nav className="flex space-x-8">
                        <Link
                            href="/admin/settings/web"
                            className="px-1 py-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            Web Settings
                        </Link>
                        <Link
                            href="/admin/settings/points"
                            className="border-b-2 border-amber-500 px-1 py-4 text-sm font-medium text-amber-600"
                        >
                            Point System
                        </Link>
                    </nav>
                </div>

                {flash?.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        {/* Publish Points */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <Award className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <CardTitle>
                                                Poin Publish Artikel
                                            </CardTitle>
                                            <CardDescription>
                                                Poin yang diberikan ketika
                                                artikel disetujui dan dipublish.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor="publish_points_enabled"
                                            className="text-sm text-muted-foreground"
                                        >
                                            {data.publish_points_enabled
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Label>
                                        <Switch
                                            id="publish_points_enabled"
                                            checked={
                                                data.publish_points_enabled
                                            }
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'publish_points_enabled',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="points_per_publish">
                                            Jumlah Poin per Publish
                                        </Label>
                                        <Input
                                            id="points_per_publish"
                                            type="number"
                                            min={0}
                                            max={1000}
                                            value={data.points_per_publish}
                                            onChange={(e) =>
                                                setData(
                                                    'points_per_publish',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            disabled={
                                                !data.publish_points_enabled
                                            }
                                            className="max-w-xs"
                                        />
                                        {errors.points_per_publish && (
                                            <p className="text-sm text-red-500">
                                                {errors.points_per_publish}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Setiap artikel yang dipublish akan
                                            mendapatkan{' '}
                                            <span className="font-medium text-amber-600">
                                                {data.points_per_publish} poin
                                            </span>{' '}
                                            (senilai{' '}
                                            {formatRupiah(
                                                data.points_per_publish *
                                                    data.rupiah_per_point,
                                            )}
                                            ).
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* View Points */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <Eye className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle>
                                                Poin dari Views
                                            </CardTitle>
                                            <CardDescription>
                                                Poin bonus berdasarkan jumlah
                                                views artikel.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor="view_points_enabled"
                                            className="text-sm text-muted-foreground"
                                        >
                                            {data.view_points_enabled
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Label>
                                        <Switch
                                            id="view_points_enabled"
                                            checked={data.view_points_enabled}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'view_points_enabled',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="views_per_point">
                                            Views per 1 Poin
                                        </Label>
                                        <Input
                                            id="views_per_point"
                                            type="number"
                                            min={1}
                                            max={1000000}
                                            value={data.views_per_point}
                                            onChange={(e) =>
                                                setData(
                                                    'views_per_point',
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                            disabled={!data.view_points_enabled}
                                        />
                                        {errors.views_per_point && (
                                            <p className="text-sm text-red-500">
                                                {errors.views_per_point}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Setiap{' '}
                                            <span className="font-medium">
                                                {data.views_per_point.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>{' '}
                                            views = 1 poin (senilai{' '}
                                            {formatRupiah(
                                                data.rupiah_per_point,
                                            )}
                                            ).
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_points_per_article">
                                            Maks Poin per Artikel
                                        </Label>
                                        <Input
                                            id="max_points_per_article"
                                            type="number"
                                            min={1}
                                            max={1000}
                                            value={data.max_points_per_article}
                                            onChange={(e) =>
                                                setData(
                                                    'max_points_per_article',
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                            disabled={!data.view_points_enabled}
                                        />
                                        {errors.max_points_per_article && (
                                            <p className="text-sm text-red-500">
                                                {errors.max_points_per_article}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Batas maksimum poin dari views per
                                            satu artikel.
                                        </p>
                                    </div>
                                </div>

                                {data.view_points_enabled && (
                                    <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                                        <p className="text-sm font-medium">
                                            Simulasi Penghasilan per Artikel
                                        </p>
                                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        data.max_points_per_article,
                                                        5,
                                                    ),
                                                },
                                                (_, i) => i + 1,
                                            ).map((point) => (
                                                <p key={point}>
                                                    {(
                                                        point *
                                                        data.views_per_point
                                                    ).toLocaleString(
                                                        'id-ID',
                                                    )}{' '}
                                                    views ={' '}
                                                    <span className="font-medium text-amber-600">
                                                        {point} poin
                                                    </span>{' '}
                                                    ={' '}
                                                    <span className="font-medium text-green-600">
                                                        {formatRupiah(
                                                            point *
                                                                data.rupiah_per_point,
                                                        )}
                                                    </span>
                                                </p>
                                            ))}
                                            {data.max_points_per_article >
                                                5 && (
                                                <>
                                                    <p className="text-muted-foreground/60">
                                                        ...
                                                    </p>
                                                    <p>
                                                        {(
                                                            data.max_points_per_article *
                                                            data.views_per_point
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}{' '}
                                                        views ={' '}
                                                        <span className="font-medium text-amber-600">
                                                            {
                                                                data.max_points_per_article
                                                            }{' '}
                                                            poin (maks)
                                                        </span>{' '}
                                                        ={' '}
                                                        <span className="font-medium text-green-600">
                                                            {formatRupiah(
                                                                data.max_points_per_article *
                                                                    data.rupiah_per_point,
                                                            )}
                                                        </span>
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Nilai Tukar */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Wallet className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Nilai Tukar Poin</CardTitle>
                                        <CardDescription>
                                            Nilai rupiah untuk setiap 1 poin.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="rupiah_per_point">
                                        Rupiah per 1 Poin
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            id="rupiah_per_point"
                                            type="number"
                                            min={0}
                                            max={10000000}
                                            value={data.rupiah_per_point}
                                            onChange={(e) =>
                                                setData(
                                                    'rupiah_per_point',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="max-w-xs"
                                        />
                                    </div>
                                    {errors.rupiah_per_point && (
                                        <p className="text-sm text-red-500">
                                            {errors.rupiah_per_point}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        1 poin ={' '}
                                        <span className="font-medium text-green-600">
                                            {formatRupiah(
                                                data.rupiah_per_point,
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Redemption Settings */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <Repeat className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle>
                                            Pengaturan Redemption
                                        </CardTitle>
                                        <CardDescription>
                                            Batasan untuk proses penukaran poin.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="max_pending_requests">
                                            Maks Pending Request
                                        </Label>
                                        <Input
                                            id="max_pending_requests"
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={data.max_pending_requests}
                                            onChange={(e) =>
                                                setData(
                                                    'max_pending_requests',
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                        />
                                        {errors.max_pending_requests && (
                                            <p className="text-sm text-red-500">
                                                {errors.max_pending_requests}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Jumlah maksimum request penukaran
                                            yang sedang pending per user.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="redemption_cooldown_hours">
                                            Cooldown (Jam)
                                        </Label>
                                        <Input
                                            id="redemption_cooldown_hours"
                                            type="number"
                                            min={0}
                                            max={720}
                                            value={
                                                data.redemption_cooldown_hours
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'redemption_cooldown_hours',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                        {errors.redemption_cooldown_hours && (
                                            <p className="text-sm text-red-500">
                                                {
                                                    errors.redemption_cooldown_hours
                                                }
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Waktu tunggu antara request
                                            penukaran (dalam jam).
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-amber-600 text-white hover:bg-amber-700"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Pengaturan'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
