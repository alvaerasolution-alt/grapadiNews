import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import type { BreadcrumbItem, RedemptionItem } from '@/types';

interface AdminRedemptionItemsEditProps {
    item: RedemptionItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Redemption Items', href: '/admin/redemption-items' },
    { title: 'Edit', href: '#' },
];

export default function AdminRedemptionItemsEdit({
    item,
}: AdminRedemptionItemsEditProps) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: item.name,
        description: item.description ?? '',
        point_cost: item.point_cost.toString(),
        rupiah_value: item.rupiah_value.toString(),
        is_active: item.is_active,
        sort_order: item.sort_order,
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        put(`/admin/redemption-items/${item.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Redemption Item" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Item
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Perbarui item penukaran.
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Detail Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData('name', e.target.value)}
                                    placeholder="Nama item"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('description', e.target.value)}
                                    placeholder="Deskripsi item (opsional)"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="point_cost">
                                        Biaya Poin
                                    </Label>
                                    <Input
                                        id="point_cost"
                                        type="number"
                                        value={data.point_cost}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData(
                                                'point_cost',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: 100"
                                    />
                                    <InputError message={errors.point_cost} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rupiah_value">
                                        Nilai Rupiah
                                    </Label>
                                    <Input
                                        id="rupiah_value"
                                        type="number"
                                        value={data.rupiah_value}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData(
                                                'rupiah_value',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: 50000"
                                    />
                                    <InputError message={errors.rupiah_value} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Urutan</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setData(
                                                'sort_order',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    <InputError message={errors.sort_order} />
                                </div>
                                <div className="flex items-end pb-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="font-normal"
                                        >
                                            Aktif
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    Simpan Perubahan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
