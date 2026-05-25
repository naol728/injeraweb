import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { Icon as TablerIcon } from "@tabler/icons-react"

export type NavMainItem = {
  title: string
  url: string
  icon: TablerIcon
  isActive?: boolean
}

export interface NavMainProps {
  items: NavMainItem[]
}

export function NavMain({ items }: NavMainProps) {

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all border-l-4",
                item.isActive
                  ? "bg-primary/10 text-primary border-primary font-medium shadow-sm"
                  : "border-transparent hover:bg-muted/40 hover:border-muted"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 transition-colors",
                  item.isActive && "text-primary"
                )}
              />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
