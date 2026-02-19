import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface AdSettings {
    mgid_site_id: string | null;
    mgid_widget_article_top: string | null;
    mgid_widget_article_bottom: string | null;
    mgid_widget_home_hero_below: string | null;
    mgid_widget_home_sidebar: string | null;
    mgid_widget_home_feed_inline: string | null;
    mgid_widget_category_top: string | null;
    mgid_widget_category_sidebar: string | null;
}

interface Props {
    settings: AdSettings;
}

export default function AdsSettingsPage({ settings }: Props) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        mgid_site_id: settings.mgid_site_id || '',
        mgid_widget_article_top: settings.mgid_widget_article_top || '',
        mgid_widget_article_bottom: settings.mgid_widget_article_bottom || '',
        mgid_widget_home_hero_below:
            settings.mgid_widget_home_hero_below || '',
        mgid_widget_home_sidebar: settings.mgid_widget_home_sidebar || '',
        mgid_widget_home_feed_inline:
            settings.mgid_widget_home_feed_inline || '',
        mgid_widget_category_top: settings.mgid_widget_category_top || '',
        mgid_widget_category_sidebar:
            settings.mgid_widget_category_sidebar || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/settings/ads', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Ads Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Settings</h1>

                <div className="mb-6 border-b">
                    <nav className="flex space-x-8">
                        <a
                            href="/admin/settings/web"
                            className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                            Web Settings
                        </a>
                        <a
                            href="/admin/settings/ads"
                            className="border-b-2 border-amber-500 px-1 py-4 text-sm font-medium text-amber-600"
                        >
                            Ads Settings
                        </a>
                    </nav>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        {/* MGID Site ID */}
                        <Card>
                            <CardHeader>
                                <CardTitle>MGID</CardTitle>
                                <CardDescription>
                                    Masukkan Site ID dan Widget ID dari akun
                                    MGID Anda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_site_id"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Site ID
                                    </label>
                                    <Input
                                        id="mgid_site_id"
                                        value={data.mgid_site_id}
                                        onChange={(e) =>
                                            setData(
                                                'mgid_site_id',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="site.com"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Domain site Anda yang terdaftar di MGID
                                        (contoh: site.com)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Article Ad Widgets */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article Page Ads</CardTitle>
                                <CardDescription>
                                    Widget ID MGID untuk halaman artikel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_article_top"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Article Top Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_article_top"
                                        value={data.mgid_widget_article_top}
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_article_top',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_article_bottom"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Article Bottom Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_article_bottom"
                                        value={data.mgid_widget_article_bottom}
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_article_bottom',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Home Page Ad Widgets */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Home Page Ads</CardTitle>
                                <CardDescription>
                                    Widget ID MGID untuk homepage.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_home_hero_below"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Hero Below Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_home_hero_below"
                                        value={data.mgid_widget_home_hero_below}
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_home_hero_below',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_home_sidebar"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Sidebar Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_home_sidebar"
                                        value={data.mgid_widget_home_sidebar}
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_home_sidebar',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_home_feed_inline"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Feed Inline Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_home_feed_inline"
                                        value={
                                            data.mgid_widget_home_feed_inline
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_home_feed_inline',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Page Ad Widgets */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Page Ads</CardTitle>
                                <CardDescription>
                                    Widget ID MGID untuk halaman kategori.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_category_top"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Category Top Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_category_top"
                                        value={data.mgid_widget_category_top}
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_category_top',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="mgid_widget_category_sidebar"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Category Sidebar Widget ID
                                    </label>
                                    <Input
                                        id="mgid_widget_category_sidebar"
                                        value={
                                            data.mgid_widget_category_sidebar
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'mgid_widget_category_sidebar',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="123456"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>

                        {/* Success Message */}
                        {flash?.success && (
                            <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                                {flash.success}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
