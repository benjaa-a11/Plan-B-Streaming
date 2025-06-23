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
import { cn } from "@/lib/utils";
import { useState, useEffect, memo } from "react";

type MdcHeroProps = {
    matches: Match[];
};

const MatchCard = memo(function MatchCard({ match }: { match: Match }) {
    const [isViewable, setIsViewable] = useState(false);

    useEffect(() => {
        const checkViewability = () => {
            const now = new Date();
            const kickoffTime = new Date(match.matchTimestamp);
            const minutesUntilKickoff = (kickoffTime.getTime() - now.getTime()) / (1000 * 60);
            
            const shouldBeViewable = match.isLive || minutesUntilKickoff <= 45;
            
            setIsViewable(shouldBeViewable);
        };
        
        checkViewability();
        const intervalId = setInterval(checkViewability, 30000); // Check every 30 seconds

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
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className={cn("w-full", match.isLive && "animate-pulse")} variant={match.isLive ? "destructive" : "default"}>
                            {match.isLive ? <Radio className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                            {match.isLive ? "Ver EN VIVO" : "Ver Partido"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        <DropdownMenuLabel>Opciones de transmisión</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {match.channels.map((channel) => (
                            <DropdownMenuItem key={channel.id} asChild>
                                <Link href={`/canal/${channel.id}`} className="flex items-center gap-3 w-full">
                                  <div className="relative h-6 w-10 flex-shrink-0">
                                      {channel.logoUrl ? (
                                          <Image
                                              src={channel.logoUrl}
                                              alt={`Logo de ${channel.name}`}
                                              fill
                                              sizes="40px"
                                              className="object-contain"
                                              data-ai-hint="channel logo"
                                          />
                                      ) : (
                                          <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted">
                                              <Clapperboard className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                      )}
                                  </div>
                                  <span className="flex-grow">{channel.name}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
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
        <Card className="w-[340px] sm:w-[380px] overflow-hidden shadow-lg">
            <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                        <Image src={match.team1Logo} alt={match.team1} width={64} height={64} className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
                        <h3 className="font-semibold truncate w-full">{match.team1}</h3>
                    </div>
                    <div className="flex-shrink-0">
                        <Image
                            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgncCRI6MuG41vT_fctpMHh4__yYc2efUPB7jpjV9Ro8unR17c9EMBQcaIYmjPShAnnLG1Q1m-9KbNmZoK2SJnWV9bwJ1FN4OMzgcBcy7inf6c9JCSKFz1uV31aC6B1u4EeGxDwQE4z24d7sVZOJzpFjBAG0KECpsJltnqNyH9_iaTnGukhT4gWGeGj_FQ/s16000/Copa%20Mundial%20de%20Clubes.png"
                            alt="Mundial de Clubes 2025 Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                            data-ai-hint="fifa logo"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center w-[100px]">
                        <Image src={match.team2Logo} alt={match.team2} width={64} height={64} className="h-16 w-16 object-contain drop-shadow-sm" data-ai-hint="team logo" />
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

export default function MdcHero({ matches }: MdcHeroProps) {
    if (matches.length === 0) {
        return null;
    }

    return (
        <div className="mb-12 font-fifa">
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Mundial de Clubes FIFA 2025™</h1>
                <p className="text-muted-foreground">Partidos de Hoy</p>
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
