"use client";

import { Home, Search, Gamepad2, Settings } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";

export default function NavBar() {
    const pathname = useLocation().pathname;

    const tabs = [
        { icon: Home, label: "Home", href: "/injera" },
        { icon: Search, label: "Search", href: "/injera/search" },
        { icon: Gamepad2, label: "Game", href: "/injera/game" },
        { icon: Settings, label: "Settings", href: "/injera/setting" },
    ];

    return (
        <>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800">
                {tabs.map(({ icon: Icon, href, label },) => {
                    const isActive = pathname === href;
                    return (
                        <Link key={href} to={href} className="flex flex-col items-center group">
                            <div
                                className={cn(
                                    "flex items-center justify-center transition-all duration-300",

                                    isActive && "text-primary",
                                    !isActive && "text-neutral-500 dark:text-neutral-400"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-6 h-6 transition-transform duration-300",
                                        isActive && "scale-110"
                                    )}
                                />
                            </div>
                            {(
                                <span
                                    className={cn(
                                        "mt-1 text-xs font-medium",
                                        isActive ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
                                    )}
                                >
                                    {label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="hidden lg:flex fixed left-0 top-0 h-full w-24 flex-col items-center justify-between py-8 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800">
                {/* Logo */}
                <div className="text-2xl font-bold text-primary mb-4">⚡</div>

                <div className="flex flex-col items-center gap-6 mt-8">
                    {tabs.map(({ icon: Icon, href, label },) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                to={href}
                                className="flex flex-col items-center transition-all group"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "w-12 h-12 rounded-2xl transition-all duration-300",

                                        isActive
                                            ? "bg-primary text-primary-foreground scale-105"
                                            : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                </Button>
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium tracking-wide",
                                        isActive ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
                                    )}
                                >
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-xs text-neutral-400 dark:text-neutral-600 mb-4"><ModeToggle /></div>
            </div >
        </>
    );
}
