
"use client";
import type { Match } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Clock, Tv, VideoOff, Clapperboard, Radio, ChevronDown } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import React, { memo, useState, useEffect } from "react";
import { useTheme } from "next-themes";


type MatchesHeroProps = {
    matches: Match[];
};

const MatchCard = memo(function MatchCard({ match }: { match: Match }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const renderButton = () => {
        if (!match.isWatchable) {
            return (
                <Button className="w-full" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Próximamente
                </Button>
            );
        }

        if (match.channels && match.channels.length > 0) {
             if (match.channels.length === 1) {
                return (
                    <Button asChild className={cn("w-full", match.isLive && "animate-pulse")} variant={match.isLive ? "destructive" : "default"}>
                        <Link href={`/canal/${match.channels[0].id}`}>
                            {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                            {match.isLive ? "Ver EN VIVO" : `Ver en ${match.channels[0].name}`}
                        </Link>
                    </Button>
                );
            }

            const commonButtonProps = {
                className: cn("w-full", match.isLive && "animate-pulse"),
                variant: (match.isLive ? "destructive" : "default") as "destructive" | "default",
            };
            const commonButtonContent = (
                <>
                    {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                    {match.isLive ? "Ver EN VIVO" : "Elegir Canal"}
                </>
            );

            const mobileChannelLinks = match.channels.map((channel) => (
                 <Link key={channel.id} href={`/canal/${channel.id}`} className="flex items-center gap-4 w-full text-left px-6 py-4 transition-colors hover:bg-muted">
                    <div className="relative h-8 w-14 flex-shrink-0">
                        {channel.logoUrl ? (
                            <Image src={channel.logoUrl} alt={`Logo de ${channel.name}`} fill sizes="56px" className="object-contain" data-ai-hint="channel logo" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
                                <Clapperboard className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <span className="flex-grow font-medium">{channel.name}</span>
                </Link>
            ));
            
            const desktopChannelLinks = match.channels.flatMap((channel, index) => {
                const item = (
                    <DropdownMenuItem key={channel.id} asChild className="p-0">
                        <Link href={`/canal/${channel.id}`} className="flex items-center gap-3 w-full px-2 py-1.5">
                            <div className="relative h-6 w-10 flex-shrink-0">
                                {channel.logoUrl ? (
                                    <Image src={channel.logoUrl} alt={`Logo de ${channel.name}`} fill sizes="40px" className="object-contain" data-ai-hint="channel logo" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted"><Clapperboard className="h-4 w-4 text-muted-foreground" /></div>
                                )}
                            </div>
                            <span className="flex-grow">{channel.name}</span>
                        </Link>
                    </DropdownMenuItem>
                );

                if (index < match.channels.length - 1) {
                    return [item, <DropdownMenuSeparator key={`sep-${channel.id}`} />];
                }
                return [item];
            });

            return (
                <>
                    {/* Desktop Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button {...commonButtonProps} className={cn(commonButtonProps.className, "hidden md:inline-flex")}>
                                {commonButtonContent}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                             <DropdownMenuLabel>Opciones de transmisión</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                            <div className="flex flex-col divide-y divide-border/50">
                                {desktopChannelLinks}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button {...commonButtonProps} className={cn(commonButtonProps.className, "md:hidden")}>
                                {commonButtonContent}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80dvh] flex flex-col p-0">
                            <SheetHeader className="text-left flex-shrink-0 border-b px-6 pt-6 pb-4">
                                <SheetTitle>Opciones para ver</SheetTitle>
                                <SheetDescription className="!mt-1">
                                    {match.team1} vs {match.team2}
                                </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="flex-grow">
                                <div className="flex flex-col divide-y divide-border/50">
                                    {mobileChannelLinks}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </>
            );
        }

        return (
            <Button className="w-full" disabled>
                <VideoOff className="mr-2 h-4 w-4" />
                No disponible
            </Button>
        );
    }

    const getTournamentLogo = () => {
        if (!match.tournamentLogo) return null;
        if (typeof match.tournamentLogo === 'string') {
            return match.tournamentLogo;
        }

        // To prevent hydration mismatch, default to a specific theme on server/initial render
        // and only switch on the client after mounting.
        if (!mounted) {
            return match.tournamentLogo.light; // Default to light theme logo
        }
        
        return resolvedTheme === 'dark' ? match.tournamentLogo.dark : match.tournamentLogo.light;
    };
    
    const tournamentLogoUrl = getTournamentLogo();

    return (
        <Card className="w-[340px] sm:w-[380px] overflow-hidden shadow-lg flex-shrink-0 opacity-0 animate-fade-in-up">
            <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                        <Image unoptimized src={match.team1Logo || ''} alt={match.team1} width={64} height={64} sizes="64px" className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                        <h3 className="font-semibold truncate w-full">{match.team1}</h3>
                    </div>

                    <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center font-bold text-sm text-muted-foreground text-center">
                       {tournamentLogoUrl ? (
                            <Image unoptimized src={tournamentLogoUrl} alt={match.tournamentName || 'Tournament'} width={48} height={48} sizes="48px" className="h-12 w-12 object-contain" data-ai-hint="tournament logo" />
                       ) : (
                           <span className="text-center">{match.tournamentName}</span>
                       )}
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                        <Image unoptimized src={match.team2Logo || ''} alt={match.team2} width={64} height={64} sizes="64px" className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                        <h3 className="font-semibold truncate w-full">{match.team2}</h3>
                    </div>
                </div>

                {match.dates && (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        {match.dates}
                    </p>
                )}
                
                {match.isLive ? (
                    <div className={cn("flex items-center gap-2 font-bold", match.dates ? "mt-2" : "mt-4")}>
                      <Badge variant="destructive" className="animate-pulse text-sm font-bold px-3 py-1">EN VIVO</Badge>
                    </div>
                  ) : (
                    <div className={cn(
                        "flex items-center gap-2 text-primary text-lg font-bold",
                        match.dates ? "mt-2" : "mt-4"
                    )}>
                        <Clock className="h-5 w-5" />
                        <span>{match.time} hs</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/40 px-6 py-4">
                {renderButton()}
            </CardFooter>
        </Card>
    );
});
MatchCard.displayName = 'MatchCard';

export default function MatchesHero({ matches }: MatchesHeroProps) {
    if (matches.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="mb-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Partidos de Hoy</h1>
                <p className="mt-1 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">La agenda del día en un solo lugar.</p>
            </div>
            {matches.length > 1 ? (
                <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                    <div className="flex w-max space-x-4 pb-4">
                        {matches.map((match, index) => (
                            <div key={match.id} style={{ animationDelay: `${index * 80}ms` }}>
                                <MatchCard match={match} />
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                <div className="flex justify-center">
                    <MatchCard match={matches[0]} />
                </div>
            )}
        </div>
    );
}
