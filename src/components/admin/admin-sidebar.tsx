
"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Tv, Film, Radio, CalendarDays, Shield, Users, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/channels", label: "Canales", icon: Tv },
    { href: "/admin/movies", label: "Películas", icon: Film },
    { href: "/admin/radios", label: "Radios", icon: Radio },
    { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/admin/tournaments", label: "Torneos", icon: Shield },
    { href: "/admin/teams", label: "Equipos", icon: Users },
];

type AdminSidebarProps = {
  className?: string;
  isMobile?: boolean;
  onLinkClick?: () => void;
};

export default function AdminSidebar({ className, isMobile = false, onLinkClick }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === href;
        return pathname.startsWith(href);
    };

    if (isMobile) {
        return (
             <div className={cn("flex h-full flex-col", className)}>
                <div className="flex h-14 items-center border-b px-4">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 font-semibold"
                        onClick={onLinkClick}
                    >
                        <Image src="/icon.png" alt="Plan B Admin Logo" width={28} height={28} />
                        <span>Plan B Admin</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-1 p-2 text-base font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                isActive(item.href) && "bg-muted text-primary"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        );
    }

    return (
        <aside className={className}>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                 <Link
                    href="/admin"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full md:h-8 md:w-8"
                >
                    <Image src="/icon.png" alt="Plan B Admin Logo" width={24} height={24} className="transition-all group-hover:scale-110" />
                    <span className="sr-only">Plan B Streaming</span>
                </Link>
                <TooltipProvider>
                    {navItems.map((item) => (
                         <Tooltip key={item.label} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                        isActive(item.href) && "bg-accent text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="sr-only">{item.label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
        </aside>
    );
}
