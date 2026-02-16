import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { ArrowLeft, Coins, AlertTriangle } from 'lucide-react';
import type { BreadcrumbItem, RedemptionItem } from '@/types';

interface RedemptionsCreateProps {
    item: RedemptionItem;
    userPoints: number;
    paymentMethods: { value: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Redeem Points', href: '/redemptions' },
    { title: 'Tukar', href: '#' },
];

const bankOptions = [
    'BCA',
    'BNI',
    'BRI',
    'Mandiri',
    'CIMB Niaga',
    'Bank Jago',
    'BSI',
];
const ewalletOptions = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'];

export default function RedemptionsCreate({
    item,
    userPoints,
    paymentMethods,
}: RedemptionsCreateProps) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        payment_method: '',
        bank_name: '',
        account_number: '',
        account_holder: '',
        ewallet_provider: '',
        ewallet_number: '',
        ewallet_name: '',
    });

    const canAfford = userPoints >= item.point_cost;
    const isBankTransfer = data.payment_method === 'bank_transfer';
    const isEWallet = data.payment_method === 'e_wallet';

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(`/redemptions/${item.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tukar Poin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {flash.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-4">
                    <Link href="/redemptions">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Tukar Poin
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lengkapi informasi penerima hadiah.
                        </p>
                    </div>
                </div>

                {!canAfford && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Poin Anda tidak cukup. Dibutuhkan {item.point_cost}{' '}
                            poin, tersedia {userPoints} poin.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Item Summary */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Ringkasan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Item
                                </p>
                                <p className="font-medium">{item.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Biaya Poin
                                </p>
                                <div className="flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-amber-600" />
                                    <span className="font-bold text-amber-600">
                                        {item.point_cost} Poin
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Nilai Hadiah
                                </p>
                                <p className="font-medium">
                                    Rp{' '}
                                    {item.rupiah_value.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Poin Anda
                                </p>
                                <Badge
                                    variant={
                                        canAfford ? 'default' : 'secondary'
                                    }
                                    className={canAfford ? 'bg-amber-600' : ''}
                                >
                                    {userPoints} Poin
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Metode Pembayaran</Label>
                                    <RadioGroup
                                        value={data.payment_method}
                                        onValueChange={(value) =>
                                            setData('payment_method', value)
                                        }
                                        className="grid grid-cols-2 gap-4"
                                        disabled={!canAfford}
                                    >
                                        {paymentMethods.map(
                                            (method: {
                                                value: string;
                                                label: string;
                                            }) => (
                                                <div key={method.value}>
                                                    <RadioGroupItem
                                                        value={method.value}
                                                        id={method.value}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={method.value}
                                                        className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-amber-600"
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {method.label}
                                                        </span>
                                                    </Label>
                                                </div>
                                            ),
                                        )}
                                    </RadioGroup>
                                    <InputError
                                        message={errors.payment_method}
                                    />
                                </div>

                                {isBankTransfer && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_name">
                                                Nama Bank
                                            </Label>
                                            <Select
                                                value={data.bank_name}
                                                onValueChange={(value) =>
                                                    setData('bank_name', value)
                                                }
                                                disabled={!canAfford}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih bank" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bankOptions.map((bank) => (
                                                        <SelectItem
                                                            key={bank}
                                                            value={bank}
                                                        >
                                                            {bank}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.bank_name}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="account_number">
                                                Nomor Rekening
                                            </Label>
                                            <Input
                                                id="account_number"
                                                value={data.account_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'account_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 1234567890"
                                                disabled={!canAfford}
                                            />
                                            <InputError
                                                message={errors.account_number}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="account_holder">
                                                Nama Pemilik Rekening
                                            </Label>
                                            <Input
                                                id="account_holder"
                                                value={data.account_holder}
                                                onChange={(e) =>
                                                    setData(
                                                        'account_holder',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Nama sesuai rekening"
                                                disabled={!canAfford}
                                            />
                                            <InputError
                                                message={errors.account_holder}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isEWallet && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ewallet_provider">
                                                Penyedia E-Wallet
                                            </Label>
                                            <Select
                                                value={data.ewallet_provider}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'ewallet_provider',
                                                        value,
                                                    )
                                                }
                                                disabled={!canAfford}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih e-wallet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ewalletOptions.map(
                                                        (provider) => (
                                                            <SelectItem
                                                                key={provider}
                                                                value={provider}
                                                            >
                                                                {provider}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.ewallet_provider
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ewallet_number">
                                                Nomor E-Wallet
                                            </Label>
                                            <Input
                                                id="ewallet_number"
                                                value={data.ewallet_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'ewallet_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 081234567890"
                                                disabled={!canAfford}
                                            />
                                            <InputError
                                                message={errors.ewallet_number}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ewallet_name">
                                                Nama Pemilik
                                            </Label>
                                            <Input
                                                id="ewallet_name"
                                                value={data.ewallet_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'ewallet_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Nama sesuai akun"
                                                disabled={!canAfford}
                                            />
                                            <InputError
                                                message={errors.ewallet_name}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            !canAfford ||
                                            !data.payment_method
                                        }
                                        className="bg-amber-600 text-white hover:bg-amber-700"
                                    >
                                        {processing
                                            ? 'Memproses...'
                                            : 'Ajukan Penukaran'}
                                    </Button>
                                    <Link href="/redemptions">
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
