import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/status-badge';
import { ArrowLeft, Coins, History } from 'lucide-react';
import type {
    BreadcrumbItem,
    PaginatedResponse,
    RedemptionRequestRow,
} from '@/types';

interface RedemptionsHistoryProps {
    requests: PaginatedResponse<RedemptionRequestRow>;
    userPoints: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Redeem Points', href: '/redemptions' },
    { title: 'Riwayat', href: '/redemptions/history' },
];

export default function RedemptionsHistory({
    requests,
    userPoints,
}: RedemptionsHistoryProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Penukaran" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/redemptions">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Riwayat Penukaran
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Riwayat permintaan penukaran poin Anda.
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-amber-600 text-white">
                        <Coins className="mr-1 h-3 w-3" />
                        {userPoints} Poin
                    </Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Semua Permintaan ({requests.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Item
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Poin
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Nilai (Rp)
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
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {requests.data.length > 0 ? (
                                        requests.data.map((req) => (
                                            <tr
                                                key={req.id}
                                                className="border-b transition-colors hover:bg-muted/50"
                                            >
                                                <td className="p-4 align-middle font-medium">
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
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                <History className="mx-auto mb-2 h-8 w-8" />
                                                Belum ada riwayat penukaran.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {requests.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {requests.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm ${
                                            link.active
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
