import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const currentPhoto = auth.user.profile_photo
        ? `/storage/${auth.user.profile_photo}`
        : null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPhotoPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name, email address, bio, and profile photo"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                            forceFormData: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Profile Photo */}
                                <div className="grid gap-2">
                                    <Label>Profile photo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-gray-700 bg-gray-800">
                                                {photoPreview || currentPhoto ? (
                                                    <img
                                                        src={photoPreview || currentPhoto || ''}
                                                        alt={auth.user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-bold text-gray-400">
                                                        {auth.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-700 bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                                            >
                                                <Camera className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Choose photo
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG or WebP. Max 2MB.
                                            </p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="profile_photo"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                    <InputError
                                        className="mt-1"
                                        message={errors.profile_photo}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {/* Bio */}
                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>

                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.bio || ''}
                                        placeholder="Write a short bio about yourself..."
                                        rows={3}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Max 500 characters. Shown on your author profile.
                                    </p>

                                    <InputError
                                        className="mt-1"
                                        message={errors.bio}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-amber-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
