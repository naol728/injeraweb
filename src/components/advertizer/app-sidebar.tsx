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
  IconShoppingCart,
  IconUserCircle, // Added for Profile
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
} from "@/components/ui/sidebar"

import { useAppSelector } from "@/store/hook"
import { useLocation } from "react-router-dom"
import { ModeToggle } from "../mode-toggle"
import { ListOrderedIcon, SunMoonIcon } from "lucide-react"

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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
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
      { title: "Overview", url: "/advertiser", icon: IconInnerShadowTop },
      { title: "Ad Videos", url: "/advertiser/advideo", icon: IconBriefcase },
      { title: "Create Ad Video", url: "/advertiser/advideo/create", icon: IconListDetails },
      { title: "Orders", url: "/advertiser/order", icon: ListOrderedIcon },
      { title: "Transactions", url: "/advertiser/transactions", icon: IconWallet },
      { title: "Settings", url: "/advertiser/settings", icon: IconSettings },
    ],

    navSecondary: [
      { title: "Get Help", url: "/advertiser/help", icon: IconHelp },
    ],
  }

  // Helper function to check if a path is active
  const isActive = (url: string) => {
    // Exact match for overview
    if (url === "/advertiser") {
      return pathname === "/advertiser" || pathname === "/advertiser/";
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
        <div className="space-y-1">
          <NavMain
            items={data.navMain.map((item) => ({
              ...item,
              isActive: isActive(item.url),
            }))}
          />
        </div>

        <div className="mt-auto p-4 border-t border-border/50">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 p-3 transition-all duration-300 hover:bg-muted/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm">
                <SunMoonIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Theme</span>
                <span className="text-xs text-muted-foreground">Light / Dark / System</span>
              </div>
            </div>
            <ModeToggle />
          </div>
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