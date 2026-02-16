<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Post management
            'create posts',
            'edit own posts',
            'edit all posts',
            'delete own posts',
            'delete all posts',
            'publish posts',

            // Category & Tag management
            'manage categories',
            'manage tags',

            // User management
            'manage users',

            // Dashboard access
            'view admin dashboard',
            'view contributor dashboard',

            // Redemption management
            'manage redemption items',
            'process redemption requests',

            // Settings
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $contributor = Role::findOrCreate('contributor');
        $contributor->syncPermissions([
            'create posts',
            'edit own posts',
            'delete own posts',
            'view contributor dashboard',
        ]);

        $admin = Role::findOrCreate('admin');
        $admin->syncPermissions($permissions);
    }
}
