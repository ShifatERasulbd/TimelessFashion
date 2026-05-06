import {
    BarChart3,
    Circle,
    FileBarChart2,
    FolderKanban,
    Gauge,
    Boxes ,
    CreditCard,
    Banknote,
    ClipboardPlus ,
    Globe,
    LifeBuoy,
    LogOut,
    Palette ,
    Tag ,
    MoreHorizontal,
    Airplay,
    Shirt,
    Users,
    Shield,
    ChartBarDecreasing,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

const homeItems = [
    { title: 'Dashboard', icon: Gauge, path: '/admin/dashboard' },
    { title: 'sldj', icon: Gauge, path: '/lsdj' },
   
];

// const locationItems=[
//     { title: 'Country', icon: Globe, path: '/countries' },
//     { title: 'State', icon: Airplay, path: '/states' },
//     { title: 'WareHouse', icon: BarChart3, path: '/warehouses' },
// ]



export function AppSidebar(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const visibleHomeItems = homeItems;
    // const visibleLocationItems = locationItems;
    

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } finally {
            setIsLoggingOut(false);
            navigate('/admin');
        }
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar" {...props}>
            <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
                <div className="flex items-center gap-2 px-1">
                    <span className="inline-flex size-4 rounded-full border border-sidebar-foreground/60" />
                    <span className="text-sm font-semibold">AVANT</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="scrollbar-hidden py-3">
                {visibleHomeItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Home</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleHomeItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* location Management  */}
                 {/* {visibleLocationItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Location Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleLocationItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )} */}

            


                
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Logout" onClick={handleLogout} disabled={isLoggingOut}>
                            <LogOut className="size-4 shrink-0 text-sidebar-foreground" />
                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}