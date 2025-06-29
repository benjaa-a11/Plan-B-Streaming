"use client";

import type { Match } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tv, Radio, Shield, Clapperboard, ChevronDown, CalendarX } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AgendaCardProps = {
    match: Match;
};

const AgendaCard = ({ match }: AgendaCardProps) => {
    const renderButton = () => {
        if (match.channels.length === 0) {
            return (
                <Button variant="secondary" disabled className="w-full">
                    <Tv className="mr-2 h-4 w-4" /> No disponible
                </Button>
            );
        }

        if (match.channels.length === 1) {
            const channel = match.channels[0];
            return (
                <Button asChild className="w-full" variant={match.isLive ? "destructive" : "default"}>
                    <Link href={`/canal/${channel.id}`}>
                        {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                        Ver en {channel.name}
                    </Link>
                </Button>
            );
        }

        const commonButtonProps = {
            className: "w-full",
            variant: (match.isLive ? "destructive" : "default") as "destructive" | "default",
        };
        const commonButtonContent = (
            <>
                {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                Ver Partido
            </>
        );

        const desktopChannelLinks = match.channels.map((channel) => (
            <DropdownMenuItem key={channel.id} asChild className="p-0">
                <Link href={`/canal/${channel.id}`} className="flex items-center gap-3 w-full px-2 py-1.5">
                    {channel.logoUrl ? (
                        <Image src={channel.logoUrl} alt={channel.name} width={24} height={24} className="h-6 w-auto object-contain" sizes="24px" data-ai-hint="channel logo"/>
                    ) : (
                        <Clapperboard className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>{channel.name}</span>
                </Link>
            </DropdownMenuItem>
        ));

        const mobileChannelLinks = match.channels.map((channel) => (
             <Link key={channel.id} href={`/canal/${channel.id}`} className="flex items-center gap-4 w-full text-left p-3 rounded-lg transition-colors hover:bg-muted">
                {channel.logoUrl ? (
                    <Image src={channel.logoUrl} alt={channel.name} width={40} height={40} className="h-10 w-auto object-contain" sizes="40px" data-ai-hint="channel logo"/>
                ) : (
                    <Clapperboard className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="flex-grow font-medium">{channel.name}</span>
            </Link>
        ));

        return (
            <>
                {/* Desktop Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button {...commonButtonProps} className={cn(commonButtonProps.className, "hidden md:inline-flex")}>
                            {commonButtonContent} <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {desktopChannelLinks}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button {...commonButtonProps} className={cn(commonButtonProps.className, "md:hidden")}>
                            {commonButtonContent}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl max-h-[80dvh] flex flex-col">
                        <SheetHeader className="text-left flex-shrink-0">
                            <SheetTitle>Elige un canal</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-grow">
                            <div className="flex flex-col gap-2 py-4 pr-4">
                                {mobileChannelLinks}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </>
        );
    };

    return (
        <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
            <div className="w-16 sm:w-20 text-center flex-shrink-0">
                {match.isLive ? (
                    <Badge variant="destructive" className="animate-pulse px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold">EN VIVO</Badge>
                ) : (
                    <div className="font-bold text-base sm:text-lg text-primary">{match.time}</div>
                )}
                <div className="text-xs text-muted-foreground truncate mt-0.5">{match.tournamentName}</div>
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                    <Image src={match.team1Logo || ''} width={20} height={20} alt={match.team1} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" sizes="24px" data-ai-hint="team logo" />
                    <span className="font-medium text-sm sm:text-base truncate">{match.team1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Image src={match.team2Logo || ''} width={20} height={20} alt={match.team2} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" sizes="24px" data-ai-hint="team logo" />
                    <span className="font-medium text-sm sm:text-base truncate">{match.team2}</span>
                </div>
            </div>
            
            <div className="w-28 sm:w-32 flex-shrink-0">
                {renderButton()}
            </div>
        </div>
    );
};

export default function AgendaHero({ matches }: { matches: Match[] }) {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="mb-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Shield className="h-7 w-7 text-primary" />
                        <span>Agenda Deportiva</span>
                    </CardTitle>
                    <p className="text-muted-foreground capitalize">{today}</p>
                </CardHeader>
                <CardContent className="p-0">
                    {matches.length > 0 ? (
                        <div>
                            {matches.map((match) => (
                                <AgendaCard key={match.id} match={match} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-10 text-center border-t">
                            <CalendarX className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-semibold">Sin partidos por hoy</h3>
                            <p className="mt-1 text-muted-foreground">No hay eventos programados en la agenda o ya han finalizado.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
