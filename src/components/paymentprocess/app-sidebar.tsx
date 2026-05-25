import * as React from "react"
import {
    IconChartBar,
    IconDatabase,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
    type Icon as TablerIcon
} from "@tabler/icons-react"

// Import additional icons for new menu items
import {
    IconBriefcase,
    IconTrendingUp,
    IconWallet,
    IconBell,
    IconBuilding,
    IconShoppingCart
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain, type NavMainItem } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"

import { useAppSelector } from "@/store/hook"
import { useLocation } from "react-router-dom"

// -------- Types --------
export interface DocumentItem {
    name: string
    url: string
    icon: TablerIcon
}

export interface SecondaryItem {
    title: string
    url: string
    icon: TablerIcon
}

export interface SidebarUser {
    name?: string
    email?: string
    avatar?: string
}

// ------------------------

export function PaymentProcessSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const { user, loading } = useAppSelector((state) => state.auth)
    const { pathname } = useLocation()

    const data: {
        user: SidebarUser
        navMain: NavMainItem[]
        documents?: DocumentItem[]
        navSecondary: SecondaryItem[]
    } = {
        user: {
            name: user?.username,
            email: user?.email,
            avatar: user?.avatar,
        },

        navMain: [
            { title: "Process Payment", url: "/paymentprocess", icon: IconInnerShadowTop },

        ],

        navSecondary: [
            { title: "Get Help", url: "/paymentprocess/help", icon: IconHelp },
        ],
    }

    // Helper function to check if a path is active
    const isActive = (url: string) => {
        // Exact match for overview
        if (url === "/paymentprocess") {
            return pathname === "/paymentprocess" || pathname === "/paymentprocess/";
        }
        // For nested routes, check if pathname starts with the url
        return pathname.startsWith(url);
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <div className="flex items-center gap-2">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">Injera Platform.</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <div className="space-y-1">
                    <NavMain
                        items={data.navMain.map((item) => ({
                            ...item,
                            isActive: isActive(item.url),
                        }))}
                    />
                </div>

                {/* Documents/Secondary Navigation */}
                {/* <div className="mt-8">
          <NavDocuments
            items={data.documents.map((item) => ({
              ...item,
              isActive: isActive(item.url),
            }))}
          />
        </div> */}

                {/* Bottom Help Section */}
                <div className="mt-auto">
                    <NavSecondary
                        items={data.navSecondary.map((item) => ({
                            ...item,
                            isActive: isActive(item.url),
                        }))}
                    />
                </div>
            </SidebarContent>

            <SidebarFooter>
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <NavUser user={data.user} />
                )}
            </SidebarFooter>
        </Sidebar>
    )
}