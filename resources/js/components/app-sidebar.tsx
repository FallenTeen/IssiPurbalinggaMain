import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart2, BriefcaseBusiness, ClipboardList, Folder, LayoutGrid, Newspaper, Settings, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface MyPageProps {
    auth: {
        user: User | null;
    };
    [key: string]: any;
}

export function AppSidebar() {
    const { auth } = usePage().props as MyPageProps;

    let mainNavItems: NavItem[] = [];
    if (auth.user) {
        const userRoles = auth.user.roles || [];

        if (userRoles.includes('admin')) {
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
        } else if (userRoles.includes('reporter')) {
            mainNavItems = [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Artikel', href: '/artikels', icon: Newspaper },
                { title: 'Profil', href: '/profile', icon: Users },
            ];
        } else if (userRoles.includes('verifikator')) {
            mainNavItems = [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Artikel', href: '/artikels', icon: Newspaper },
                { title: 'Events', href: '/events', icon: BriefcaseBusiness },
                { title: 'Admin Registrasi', href: '/admin/registrations', icon: Users },
                { title: 'Profil', href: '/profile', icon: Users }, // Contoh: rute profil
            ];
        } else {
            // Peran default untuk pengguna yang login tetapi tidak memiliki peran khusus di atas
            mainNavItems = [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Registrasi Saya', href: '/registrasi-saya', icon: ClipboardList },
                { title: 'Profil', href: '/profile', icon: Users },
            ];
        }
    } else {
        // Jika tidak ada user yang login (guest), mungkin tampilkan menu publik
        // Atau biarkan kosong jika Anda tidak ingin menampilkan menu sidebar untuk tamu
        mainNavItems = [
            // { title: 'Beranda', href: '/', icon: Home },
            // { title: 'Artikel Publik', href: '/artikels', icon: Newspaper },
            // { title: 'Event Publik', href: '/events', icon: BriefcaseBusiness },
        ];
    }


    const footerNavItems: NavItem[] = [
        // {
        //      title: 'Repository',
        //      href: 'https://github.com/laravel/react-starter-kit',
        //      icon: Folder,
        // },
        // {
        //      title: 'Documentation',
        //      href: 'https://laravel.com/docs/starter-kits#react',
        //      icon: BookOpen, // Assuming BookOpen is imported or available
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
