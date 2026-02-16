import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import StatusBadge from '@/components/status-badge';
import type { BreadcrumbItem, RedemptionRequestDetail } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface AdminRedemptionRequestsShowProps {
    redemptionRequest: RedemptionRequestDetail;
    availableStatuses: { value: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Redemption Requests', href: '/admin/redemption-requests' },
    { title: 'Detail', href: '#' },
];

export default function AdminRedemptionRequestsShow({
    redemptionRequest,
    availableStatuses,
}: AdminRedemptionRequestsShowProps) {
    const { flash } = usePage().props;
    const { data, setData, patch, processing, errors } = useForm({
        status: '',
        admin_note: '',
    });

    const canUpdateStatus =
        redemptionRequest.status === 'pending' ||
        redemptionRequest.status === 'processing';

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        patch(`/admin/redemption-requests/${redemptionRequest.id}/status`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Redemption Request" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-4">
                    <Link href="/admin/redemption-requests">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Detail Permintaan #{redemptionRequest.id}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola status permintaan penukaran.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Request Details */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi User</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Nama
                                        </p>
                                        <p className="font-medium">
                                            {redemptionRequest.user?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="font-medium">
                                            {redemptionRequest.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Item</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Nama Item
                                    </p>
                                    <p className="font-medium">
                                        {redemptionRequest.item.name}
                                    </p>
                                    {redemptionRequest.item.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {redemptionRequest.item.description}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Biaya Poin
                                        </p>
                                        <p className="font-medium">
                                            {redemptionRequest.point_cost} Poin
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Nilai Rupiah
                                        </p>
                                        <p className="font-medium">
                                            Rp{' '}
                                            {redemptionRequest.rupiah_value.toLocaleString(
                                                'id-ID',
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Metode
                                    </p>
                                    <p className="font-medium">
                                        {redemptionRequest.payment_method_label}
                                    </p>
                                </div>

                                {redemptionRequest.payment_method ===
                                    'bank_transfer' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Nama Bank
                                            </p>
                                            <p className="font-medium">
                                                {redemptionRequest.bank_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Nomor Rekening
                                            </p>
                                            <p className="font-medium">
                                                {
                                                    redemptionRequest.account_number
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Nama Pemilik
                                            </p>
                                            <p className="font-medium">
                                                {
                                                    redemptionRequest.account_holder
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {redemptionRequest.payment_method ===
                                    'e_wallet' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Penyedia
                                            </p>
                                            <p className="font-medium">
                                                {
                                                    redemptionRequest.ewallet_provider
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Nomor
                                            </p>
                                            <p className="font-medium">
                                                {
                                                    redemptionRequest.ewallet_number
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Nama Pemilik
                                            </p>
                                            <p className="font-medium">
                                                {redemptionRequest.ewallet_name}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status & Proses</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Status Saat Ini
                                    </p>
                                    <div className="mt-1">
                                        <StatusBadge
                                            status={redemptionRequest.status}
                                            label={
                                                redemptionRequest.status_label
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Diajukan
                                    </p>
                                    <p className="font-medium">
                                        {redemptionRequest.created_at_human}
                                    </p>
                                </div>
                                {redemptionRequest.processor && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Diproses Oleh
                                        </p>
                                        <p className="font-medium">
                                            {redemptionRequest.processor.name}
                                        </p>
                                    </div>
                                )}
                                {redemptionRequest.processed_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Waktu Proses
                                        </p>
                                        <p className="font-medium">
                                            {new Date(
                                                redemptionRequest.processed_at,
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                )}
                                {redemptionRequest.admin_note && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Catatan Admin
                                        </p>
                                        <p className="font-medium">
                                            {redemptionRequest.admin_note}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Update Status Form */}
                    {canUpdateStatus && (
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>Update Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Status Baru
                                        </label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData('status', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStatuses.map(
                                                    (status) => (
                                                        <SelectItem
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            {status.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Catatan Admin
                                        </label>
                                        <Textarea
                                            value={data.admin_note}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLTextAreaElement>,
                                            ) =>
                                                setData(
                                                    'admin_note',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tambahkan catatan (opsional)"
                                            rows={4}
                                        />
                                        <InputError
                                            message={errors.admin_note}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing || !data.status}
                                        className="w-full bg-amber-600 text-white hover:bg-amber-700"
                                    >
                                        Update Status
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
