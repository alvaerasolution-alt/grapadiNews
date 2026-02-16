import { Head, Link, router, usePage } from '@inertiajs/react';
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
import StatusBadge from '@/components/status-badge';
import type {
    BreadcrumbItem,
    PaginatedResponse,
    RedemptionRequestRow,
} from '@/types';
import { Eye } from 'lucide-react';

interface AdminRedemptionRequestsIndexProps {
    requests: PaginatedResponse<RedemptionRequestRow>;
    statuses: { value: string; label: string }[];
    currentStatus: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Redemption Requests', href: '/admin/redemption-requests' },
];

export default function AdminRedemptionRequestsIndex({
    requests,
    statuses,
    currentStatus,
}: AdminRedemptionRequestsIndexProps) {
    const { flash } = usePage().props;

    function handleStatusChange(value: string) {
        router.get(
            '/admin/redemption-requests',
            value === 'all' ? {} : { status: value },
            { preserveState: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Redemption Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Redemption Requests
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola permintaan penukaran poin.
                        </p>
                    </div>
                    <div className="w-48">
                        <Select
                            value={currentStatus || 'all'}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permintaan ({requests.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            User
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Item
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Poin
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Nilai
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Metode
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Tanggal
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {requests.data.length > 0 ? (
                                        requests.data.map((req) => (
                                            <tr
                                                key={req.id}
                                                className="border-b transition-colors hover:bg-muted/50"
                                            >
                                                <td className="p-4 align-middle">
                                                    <div>
                                                        <p className="font-medium">
                                                            {req.user?.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {req.user?.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {req.item_name}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {req.point_cost}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    Rp{' '}
                                                    {req.rupiah_value.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {req.payment_method_label}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <StatusBadge
                                                        status={req.status}
                                                        label={req.status_label}
                                                    />
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {req.created_at_human}
                                                </td>
                                                <td className="p-4 text-right align-middle">
                                                    <Link
                                                        href={`/admin/redemption-requests/${req.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                View
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="p-4 text-center text-muted-foreground"
                                            >
                                                Tidak ada permintaan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {requests.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {requests.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm ${link.active
                                                ? 'bg-amber-600 text-white'
                                                : link.url
                                                    ? 'hover:bg-muted'
                                                    : 'pointer-events-none text-muted-foreground'
                                            }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
