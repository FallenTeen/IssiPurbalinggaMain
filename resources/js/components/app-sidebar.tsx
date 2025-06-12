import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart2, BriefcaseBusiness, ClipboardList, Folder, LayoutGrid, Newspaper, Settings, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface UserProps {
    role: string;
}

export function AppSidebar() {
    const { auth } = usePage().props as unknown as { auth: { user: { role: string } } };
    let mainNavItems: NavItem[] = [];

    if (auth.user.role === 'admin') {
        mainNavItems = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Artikel', href: '/artikels', icon: Newspaper },
            { title: 'Kategori Artikel', href: '/kategori-artikels', icon: Folder },
            { title: 'Events', href: '/events', icon: BriefcaseBusiness },
            { title: 'Admin Registrasi', href: '/admin/registrations', icon: Users },
            { title: 'Manajemen Pengguna', href: '/users', icon: Users },
            { title: 'Model ML', href: '/ml-models', icon: Settings },
            { title: 'Interaksi Pengguna', href: '/interaksi-users', icon: BarChart2 },
        ];
    } else if (auth.user.role === 'reporter') {
        mainNavItems = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Artikel', href: '/artikels', icon: Newspaper },
            { title: 'Profil', href: '/profile', icon: Users },
        ];
    } else if (auth.user.role === 'verifikator') {
        mainNavItems = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Artikel', href: '/artikels', icon: Newspaper },
            { title: 'Events', href: '/events', icon: BriefcaseBusiness },
            { title: 'Admin Registrasi', href: '/admin/registrations', icon: Users },
            { title: 'Profil', href: '/profile', icon: Users },
        ];
    } else {
        // Default to 'user' role
        mainNavItems = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Registrasi Saya', href: '/registrasi-saya', icon: ClipboardList },
            { title: 'Profil', href: '/profile', icon: Users },
        ];
    }

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Repository',
        //     href: 'https://github.com/laravel/react-starter-kit',
        //     icon: Folder,
        // },
        // {
        //     title: 'Documentation',
        //     href: 'https://laravel.com/docs/starter-kits#react',
        //     icon: BookOpen,
        // },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
