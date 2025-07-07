"use client"

import Link from "next/link";
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
};

export default function AdminSidebar({ className, isMobile = false }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === href;
        return pathname.startsWith(href);
    };

    if (isMobile) {
        return (
             <div className={cn("flex h-full flex-col", className)}>
                <nav className="flex flex-col gap-2 p-4 text-base font-medium">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-2.5 text-lg font-semibold mb-4"
                    >
                        <Tv className="h-6 w-6 text-primary" />
                        <span>Plan B Admin</span>
                    </Link>

                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                isActive(item.href) && "bg-muted text-primary"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto p-4 border-t">
                     <Link
                        href="/ajustes"
                        className="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                        <Settings className="h-5 w-5" />
                        Ajustes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <aside className={className}>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                 <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Tv className="h-4 w-4 transition-all group-hover:scale-110" />
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
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Link
                                href="/ajustes"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Ajustes</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">Ajustes</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    );
}
