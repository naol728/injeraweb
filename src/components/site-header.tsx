// SiteHeader.tsx
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import AdvertiserWallet from "@/pages/advertizer/Wallet"
import { useAppSelector } from "@/store/hook"
import { motion } from "framer-motion"
import { LayoutDashboard } from "lucide-react"

export function SiteHeader() {
  const user = useAppSelector((state) => state.auth?.user)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-base font-medium">Dashboard</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user?.type === "advertiser" && <AdvertiserWallet />}
        </div>
      </div>
    </motion.header>
  )
}