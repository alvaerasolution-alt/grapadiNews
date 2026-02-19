import { Form, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface CreateUserProps {
    roles: string[];
    errors?: {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Create User', href: '/admin/users/create' },
];

export default function CreateUser({ roles, errors }: CreateUserProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new user account with role assignment.
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action="/admin/users"
                            method="post"
                            className="flex flex-col gap-6"
                        >
                            <div className="grid gap-6">
                                {/* Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors?.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {errors?.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Leave empty to auto-generate"
                                        onChange={(e) =>
                                            setShowPassword(
                                                e.target.value.length > 0,
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        If left empty, a random 12-character
                                        password will be generated.
                                    </p>
                                    {errors?.password && (
                                        <p className="text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Password Confirmation */}
                                {showPassword && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm Password{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            placeholder="Confirm password"
                                            required={showPassword}
                                        />
                                    </div>
                                )}

                                {/* Role */}
                                <div className="grid gap-2">
                                    <Label htmlFor="role">
                                        Role{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select name="role" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                >
                                                    {role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors?.role && (
                                        <p className="text-sm text-red-500">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Alert Info */}
                            <Alert>
                                <AlertDescription>
                                    The new user will receive the selected role
                                    permissions immediately upon creation.
                                </AlertDescription>
                            </Alert>

                            {/* Buttons */}
                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1">
                                    Create User
                                </Button>
                                <Link href="/admin/users">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
