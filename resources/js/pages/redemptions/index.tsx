import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Gift, History, Coins } from 'lucide-react';
import type { BreadcrumbItem, RedemptionItem } from '@/types';

interface RedemptionsIndexProps {
    items: RedemptionItem[];
    userPoints: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Redeem Points', href: '/redemptions' },
];

export default function RedemptionsIndex({
    items,
    userPoints,
}: RedemptionsIndexProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Redeem Points" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Header with Points */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Redeem Points
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tukarkan poin Anda dengan hadiah menarik.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/redemptions/history">
                            <Button variant="outline">
                                <History className="mr-2 h-4 w-4" />
                                Riwayat
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Points Card */}
                <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-amber-100">
                                Poin Anda
                            </p>
                            <p className="text-4xl font-bold">
                                {userPoints.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <Coins className="h-12 w-12 text-amber-200" />
                    </CardContent>
                </Card>

                {/* Items Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                        const canAfford = userPoints >= item.point_cost;
                        return (
                            <Card key={item.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">
                                            {item.name}
                                        </CardTitle>
                                        <Gift className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col justify-end gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Biaya Poin
                                            </span>
                                            <Badge
                                                variant={
                                                    canAfford
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    canAfford
                                                        ? 'bg-amber-600'
                                                        : ''
                                                }
                                            >
                                                {item.point_cost} Poin
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Nilai
                                            </span>
                                            <span className="font-medium">
                                                Rp{' '}
                                                {item.rupiah_value.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/redemptions/${item.id}/create`}
                                    >
                                        <Button
                                            className="w-full bg-amber-600 text-white hover:bg-amber-700"
                                            disabled={!canAfford}
                                        >
                                            {canAfford
                                                ? 'Tukar Sekarang'
                                                : 'Poin Tidak Cukup'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {items.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Belum ada item penukaran tersedia.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
