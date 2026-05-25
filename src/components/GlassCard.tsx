import React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

/**
 * GlassCard — a reusable wrapper that adds a frosted glass effect
 * without modifying the internal shadcn/ui Card component.
 */
export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-2xl p-[1px] overflow-hidden",
                "bg-gradient-to-br from-white/20 to-white/5",
                "backdrop-blur-xl border border-white/20 shadow-lg",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
