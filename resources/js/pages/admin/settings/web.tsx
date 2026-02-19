import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface WebSettings {
    site_name: string;
    site_logo: string | null;
    site_tagline: string;
    footer_text: string;
    favicon: string | null;
    social_facebook: string | null;
    social_instagram: string | null;
    social_twitter: string | null;
    social_youtube: string | null;
    social_tiktok: string | null;
    social_linkedin: string | null;
}

interface Props {
    settings: WebSettings;
}

export default function WebSettingsPage({ settings }: Props) {
    const { flash } = usePage().props as any;
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.site_logo ? settings.site_logo : null,
    );
    const [faviconPreview, setFaviconPreview] = useState<string | null>(
        settings.favicon ? settings.favicon : null,
    );

    const { data, setData, post, processing, errors } = useForm({
        site_name: settings.site_name,
        site_tagline: settings.site_tagline,
        footer_text: settings.footer_text,
        site_logo: null as File | null,
        favicon: null as File | null,
        social_facebook: settings.social_facebook || '',
        social_instagram: settings.social_instagram || '',
        social_twitter: settings.social_twitter || '',
        social_youtube: settings.social_youtube || '',
        social_tiktok: settings.social_tiktok || '',
        social_linkedin: settings.social_linkedin || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/settings/web', {
            forceFormData: true,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('site_logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('favicon', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout>
            <Head title="Web Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Settings</h1>

                <div className="mb-6 border-b">
                    <nav className="flex space-x-8">
                        <Link
                            href="/admin/settings/web"
                            className="border-b-2 border-amber-500 px-1 py-4 text-sm font-medium text-amber-600"
                        >
                            Web Settings
                        </Link>
                    </nav>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        {/* Site Identity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Site Identity</CardTitle>
                                <CardDescription>
                                    Manage your website name, logo, and favicon.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Site Name */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="site_name"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Site Name
                                    </label>
                                    <Input
                                        id="site_name"
                                        value={data.site_name}
                                        onChange={(e) =>
                                            setData('site_name', e.target.value)
                                        }
                                        placeholder="GrapadiNews"
                                        className="w-full"
                                    />
                                    {errors.site_name && (
                                        <p className="text-sm text-red-500">
                                            {errors.site_name}
                                        </p>
                                    )}
                                </div>

                                {/* Site Tagline */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="site_tagline"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Site Tagline
                                    </label>
                                    <Input
                                        id="site_tagline"
                                        value={data.site_tagline}
                                        onChange={(e) =>
                                            setData(
                                                'site_tagline',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Platform berita dan artikel terkini..."
                                        className="w-full"
                                    />
                                    {errors.site_tagline && (
                                        <p className="text-sm text-red-500">
                                            {errors.site_tagline}
                                        </p>
                                    )}
                                </div>

                                {/* Site Logo */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="site_logo"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Site Logo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="site_logo"
                                            type="file"
                                            accept=".svg,.png,.jpg,.jpeg"
                                            onChange={handleLogoChange}
                                            className="flex-1"
                                        />
                                        {settings.site_logo && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Are you sure you want to remove the logo?',
                                                        )
                                                    ) {
                                                        router.delete(
                                                            '/admin/settings/web/logo/delete',
                                                        );
                                                    }
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    {logoPreview && (
                                        <div className="mt-2">
                                            <p className="mb-2 text-sm text-gray-500">
                                                Preview:
                                            </p>
                                            <img
                                                src={logoPreview}
                                                alt="Logo Preview"
                                                className="h-16 w-auto rounded border object-contain p-2"
                                            />
                                        </div>
                                    )}
                                    {errors.site_logo && (
                                        <p className="text-sm text-red-500">
                                            {errors.site_logo}
                                        </p>
                                    )}
                                </div>

                                {/* Favicon */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="favicon"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Favicon
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="favicon"
                                            type="file"
                                            accept=".ico,.png"
                                            onChange={handleFaviconChange}
                                            className="flex-1"
                                        />
                                        {settings.favicon && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Are you sure you want to remove the favicon?',
                                                        )
                                                    ) {
                                                        router.delete(
                                                            '/admin/settings/web/favicon/delete',
                                                        );
                                                    }
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    {faviconPreview && (
                                        <div className="mt-2">
                                            <p className="mb-2 text-sm text-gray-500">
                                                Preview:
                                            </p>
                                            <img
                                                src={faviconPreview}
                                                alt="Favicon Preview"
                                                className="h-8 w-8 rounded border object-contain p-1"
                                            />
                                        </div>
                                    )}
                                    {errors.favicon && (
                                        <p className="text-sm text-red-500">
                                            {errors.favicon}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Footer Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Footer Settings</CardTitle>
                                <CardDescription>
                                    Customize your website footer text.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="footer_text"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Footer Text
                                    </label>
                                    <Textarea
                                        id="footer_text"
                                        value={data.footer_text}
                                        onChange={(e) =>
                                            setData(
                                                'footer_text',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Platform berita dan artikel terkini..."
                                        rows={4}
                                        className="w-full"
                                    />
                                    {errors.footer_text && (
                                        <p className="text-sm text-red-500">
                                            {errors.footer_text}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Social Media</CardTitle>
                                <CardDescription>
                                    Configure your social media links displayed
                                    in the footer and article pages.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Facebook */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social_facebook"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Facebook URL
                                    </label>
                                    <Input
                                        id="social_facebook"
                                        type="url"
                                        value={data.social_facebook}
                                        onChange={(e) =>
                                            setData(
                                                'social_facebook',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://facebook.com/yourpage"
                                        className="w-full"
                                    />
                                    {errors.social_facebook && (
                                        <p className="text-sm text-red-500">
                                            {errors.social_facebook}
                                        </p>
                                    )}
                                </div>

                                {/* Instagram */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social_instagram"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Instagram URL
                                    </label>
                                    <Input
                                        id="social_instagram"
                                        type="url"
                                        value={data.social_instagram}
                                        onChange={(e) =>
                                            setData(
                                                'social_instagram',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://instagram.com/yourprofile"
                                        className="w-full"
                                    />
                                    {errors.social_instagram && (
                                        <p className="text-sm text-red-500">
                                            {errors.social_instagram}
                                        </p>
                                    )}
                                </div>

                                {/* Twitter/X */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social_twitter"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Twitter/X URL
                                    </label>
                                    <Input
                                        id="social_twitter"
                                        type="url"
                                        value={data.social_twitter}
                                        onChange={(e) =>
                                            setData(
                                                'social_twitter',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://twitter.com/yourhandle"
                                        className="w-full"
                                    />
                                    {errors.social_twitter && (
                                        <p className="text-sm text-red-500">
                                            {errors.social_twitter}
                                        </p>
                                    )}
                                </div>

                                {/* YouTube */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social_youtube"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        YouTube URL
                                    </label>
                                    <Input
                                        id="social_youtube"
                                        type="url"
                                        value={data.social_youtube}
                                        onChange={(e) =>
                                            setData(
                                                'social_youtube',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://youtube.com/channel/yourchannel"
                                        className="w-full"
                                    />
                                    {errors.social_youtube && (
                                        <p className="text-sm text-red-500">
                                            {errors.social_youtube}
                                        </p>
                                    )}
                                </div>

                                {/* TikTok */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social_tiktok"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        TikTok URL
                                    </label>
                                    <Input
                                        id="social_tiktok"
                                        type="url"
                                        value={data.social_tiktok}
                                        onChange={(e) =>
                                            setData(
                                                'social_tiktok',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://tiktok.com/@yourhandle"
                                        className="w-full"
                                    />
                                    {errors.social_tiktok && (
                                        <p className="text-sm text-red-500">
                                            {errors.social_tiktok}
                                        </p>
                                    )}
                                </div>

                                {/* LinkedIn */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="social_linkedin"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        LinkedIn URL
                                    </label>
                                    <Input
                                        id="social_linkedin"
                                        type="url"
                                        value={data.social_linkedin}
                                        onChange={(e) =>
                                            setData(
                                                'social_linkedin',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://linkedin.com/company/yourcompany"
                                        className="w-full"
                                    />
                                    {errors.social_linkedin && (
                                        <p className="text-sm text-red-500">
                                            {errors.social_linkedin}
                                        </p>
                                    )}
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
