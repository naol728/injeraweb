import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ExternalLink } from "lucide-react"
import type { AdVideo } from "@/types/models/adVideo"
import { Link } from "react-router-dom"

export function AdvertiserHoverCard({ v }: { v: AdVideo }) {
    const advertiser = v.advertiser

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <span className="font-semibold text-forground hover:underline cursor-pointer">
                    @{advertiser?.username}
                </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Link to="/profile">
                        <Avatar>
                            <AvatarImage src={advertiser?.avatar || "/placeholder-avatar.png"} />
                            <AvatarFallback>
                                {advertiser?.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </Link>

                    <div>
                        <h4 className="font-semibold text-base">
                            {advertiser?.username}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                            {advertiser?.email}
                        </p>
                    </div>
                </div>

                <Separator />

                {advertiser?.website_url ? (
                    <a
                        href={advertiser.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {advertiser.website_url}
                    </a>
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No website available
                    </p>
                )}
            </HoverCardContent>

        </HoverCard >
    )
}
