"use client";
import type { Match } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Clock, Tv, VideoOff, Clapperboard, Radio, Timer } from "lucide-react";
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
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo } from "react";
import { useTheme } from "@/components/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";

type MatchesHeroProps = {
    matches: Match[];
};

const MatchCard = memo(function MatchCard({ match }: { match: Match }) {
    const [isViewable, setIsViewable] = useState(false);
    const { theme } = useTheme();
    const [tournamentLogoUrl, setTournamentLogoUrl] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        if (typeof match.tournamentLogo === 'string') {
            setTournamentLogoUrl(match.tournamentLogo);
            return;
        }

        let currentTheme = theme;
        if (theme === 'system') {
            currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        setTournamentLogoUrl(currentTheme === 'dark' ? match.tournamentLogo.dark : match.tournamentLogo.light);
    }, [theme, match.tournamentLogo, isClient]);

    useEffect(() => {
        const checkViewability = () => {
            const now = new Date();
            const kickoffTime = new Date(match.matchTimestamp);
            const minutesUntilKickoff = (kickoffTime.getTime() - now.getTime()) / (1000 * 60);
            
            const shouldBeViewable = match.isLive || minutesUntilKickoff <= 45;
            
            setIsViewable(shouldBeViewable);
        };
        
        checkViewability();
        const intervalId = setInterval(checkViewability, 30000);

        return () => clearInterval(intervalId);
    }, [match.matchTimestamp, match.isLive]);

    const renderButton = () => {
        if (!isViewable) {
            return (
                <Button className="w-full" disabled variant="secondary">
                    <Timer className="mr-2 h-4 w-4" />
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
                    {match.isLive ? "Ver EN VIVO" : "Ver Partido"}
                </>
            );

            const mobileChannelLinks = match.channels.map((channel) => (
                 <Link key={channel.id} href={`/canal/${channel.id}`} className="flex items-center gap-4 w-full text-left p-3 rounded-lg transition-colors hover:bg-muted">
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
            
            const desktopChannelLinks = match.channels.map((channel) => (
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
            ));

            return (
                <>
                    {/* Desktop Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button {...commonButtonProps} className={cn(commonButtonProps.className, "hidden md:inline-flex")}>
                                {commonButtonContent}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            <DropdownMenuLabel>Opciones de transmisión</DropdownMenuLabel>
                            <DropdownMenuSeparator />
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
        }

        return (
            <Button className="w-full" disabled>
                <VideoOff className="mr-2 h-4 w-4" />
                No disponible
            </Button>
        );
    }
    
    return (
        <Card className="w-[340px] sm:w-[380px] overflow-hidden shadow-lg flex-shrink-0">
            <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                        <Image src={match.team1Logo} alt={match.team1} width={64} height={64} sizes="64px" className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                        <h3 className="font-semibold truncate w-full">{match.team1}</h3>
                    </div>
                    <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center">
                        {!isClient || !tournamentLogoUrl ? (
                            <Skeleton className="h-12 w-12 rounded-md" />
                        ) : (
                            <Image
                                src={tournamentLogoUrl}
                                alt={`${match.tournamentName} Logo`}
                                width={48}
                                height={48}
                                sizes="48px"
                                className="object-contain"
                                data-ai-hint="tournament logo"
                            />
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                        <Image src={match.team2Logo} alt={match.team2} width={64} height={64} sizes="64px" className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                        <h3 className="font-semibold truncate w-full">{match.team2}</h3>
                    </div>
                </div>

                {match.matchDetails && (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        {match.matchDetails}
                    </p>
                )}
                
                {match.isLive ? (
                    <div className={cn("flex items-center gap-2 font-bold", match.matchDetails ? "mt-2" : "mt-4")}>
                      <Badge variant="destructive" className="animate-pulse text-sm font-bold px-3 py-1">EN VIVO</Badge>
                    </div>
                  ) : (
                    <div className={cn(
                        "flex items-center gap-2 text-primary text-lg font-bold",
                        match.matchDetails ? "mt-2" : "mt-4"
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
        <div className="mb-12">
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Partidos de Hoy</h1>
                <p className="text-muted-foreground">La agenda del día en un solo lugar.</p>
            </div>
            <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <div className="flex w-max space-x-4 pb-4">
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
