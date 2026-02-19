import { Link, usePage } from '@inertiajs/react';
import {
    FileText,
    Folder,
    Gift,
    Image,
    LayoutGrid,
    Newspaper,
    Settings,
    Shield,
    Tag,
    Users,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'My Articles',
        href: '/posts',
        icon: FileText,
    },
    {
        title: 'Redeem Points',
        href: '/redemptions',
        icon: Gift,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin',
        icon: Shield,
    },
    {
        title: 'Manage Posts',
        href: '/admin/posts',
        icon: Newspaper,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Folder,
    },
    {
        title: 'Tags',
        href: '/admin/tags',
        icon: Tag,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Redemption Items',
        href: '/admin/redemption-items',
        icon: Gift,
    },
    {
        title: 'Redemption Requests',
        href: '/admin/redemption-requests',
        icon: FileText,
    },
    {
        title: 'Banners',
        href: '/admin/banners',
        icon: Image,
    },
    {
        title: 'Web Settings',
        href: '/admin/settings/web',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user.roles.includes('admin');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {isAdmin && (
                    <NavMain items={adminNavItems} label="Administration" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
