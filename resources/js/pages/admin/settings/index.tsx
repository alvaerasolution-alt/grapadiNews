import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save } from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Setting {
    id: number;
    key: string;
    value: string;
    description: string;
}

interface AdminSettingsIndexProps {
    settings: Setting[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Settings', href: '/admin/settings' },
];

export default function AdminSettingsIndex({
    settings,
}: AdminSettingsIndexProps) {
    const { flash } = usePage().props;
    const [values, setValues] = useState<Record<number, string>>(
        Object.fromEntries(settings.map((s) => [s.id, s.value])),
    );
    const [processing, setProcessing] = useState(false);

    function updateValue(id: number, value: string) {
        setValues((prev) => ({ ...prev, [id]: value }));
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setProcessing(true);

        const payload = settings.map((s) => ({
            id: s.id,
            key: s.key,
            value: values[s.id] ?? s.value,
        }));

        router.put(
            '/admin/settings',
            { settings: payload },
            {
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
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

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage application settings.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Application Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {settings.length > 0 ? (
                                settings.map((setting) => (
                                    <div key={setting.id} className="space-y-2">
                                        <Label
                                            htmlFor={`setting-${setting.id}`}
                                        >
                                            {setting.key}
                                        </Label>
                                        {setting.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {setting.description}
                                            </p>
                                        )}
                                        <Input
                                            id={`setting-${setting.id}`}
                                            value={values[setting.id] ?? ''}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                updateValue(
                                                    setting.id,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No settings configured.
                                </p>
                            )}

                            {settings.length > 0 && (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Settings
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
