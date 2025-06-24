"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, Loader2, SwitchCamera } from "lucide-react";
import { useState, useEffect, useMemo, memo } from "react";

import type { Channel } from "@/types";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import ChannelCard from "@/components/channel-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type ChannelViewProps = {
  channel: Channel;
  relatedChannels: Channel[];
};

/**
 * Converts various YouTube URL formats into a standard embeddable URL.
 * This allows using regular YouTube links in the database.
 * @param url The original URL from the database.
 * @returns A standardized YouTube embed URL or the original URL if not a YouTube link.
 */
const getStreamableUrl = (url: string): string => {
    if (!url) return '';
    
    let videoId: string | null = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.startsWith('/embed/')) {
          videoId = urlObj.pathname.split('/')[2];
        } else if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        }
      } else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.substring(1).split('?')[0];
      }
    } catch (error) {
      return url;
    }
  
    if (videoId) {
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
      embedUrl.searchParams.set('autoplay', '1');
      embedUrl.searchParams.set('modestbranding', '1');
      embedUrl.searchParams.set('iv_load_policy', '3');
      return embedUrl.toString();
    }
    
    return url;
  };


const ChannelView = memo(function ChannelView({ channel, relatedChannels }: ChannelViewProps) {
  const { isFavorite, addFavorite, removeFavorite, isLoaded } = useFavorites();
  const { toast } = useToast();

  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);

  const isFav = isLoaded ? isFavorite(channel.id) : false;
  
  const streamLinks = useMemo(
    () => (channel.streamUrl || []).map(getStreamableUrl),
    [channel.streamUrl]
  );
  const currentStreamUrl = streamLinks[currentStreamIndex];

  useEffect(() => {
    setIsPlayerLoading(true);
  }, [channel.id, currentStreamUrl]);

  const handleFavoriteClick = () => {
    if (isFav) {
      removeFavorite(channel.id);
    } else {
      addFavorite(channel.id);
    }
  };

  const handleSwitchStream = () => {
    const nextIndex = (currentStreamIndex + 1) % streamLinks.length;
    setCurrentStreamIndex(nextIndex);
    toast({
      title: "Cambiando de fuente",
      description: `Cargando Opción ${nextIndex + 1} de ${streamLinks.length}...`,
      duration: 3000,
    });
  };
  
  const handleIframeLoad = () => {
    setIsPlayerLoading(false);
  };

  const renderPlayer = () => {
    if (!currentStreamUrl) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-center">
          <p className="mt-2 max-w-md text-muted-foreground">
            Este canal no tiene una fuente de transmisión configurada.
          </p>
        </div>
      );
    }

    return (
      <>
        {isPlayerLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-primary-foreground">Cargando señal...</p>
            {streamLinks.length > 1 && <p className="text-sm text-muted-foreground">Opción {currentStreamIndex + 1} de {streamLinks.length}</p>}
          </div>
        )}
        <iframe
          key={currentStreamUrl}
          className="h-full w-full border-0"
          src={currentStreamUrl}
          title={channel.name}
          onLoad={handleIframeLoad}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 pt-safe-top">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/" aria-label="Volver a inicio">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
             <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                {channel.logoUrl ? (
                    <Image src={channel.logoUrl} alt={`Logo de ${channel.name}`} fill className="object-contain"/>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">{channel.name.charAt(0)}</div>
                )}
            </div>
            <div>
              <h1 className="text-lg font-semibold">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">{channel.category}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isLoaded ? (
                 <Button
                    variant={isFav ? "default" : "outline"}
                    size="icon"
                    onClick={handleFavoriteClick}
                    aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                    className="transition-all duration-200"
                >
                    <Heart className={cn("h-5 w-5", isFav && "fill-current text-primary-foreground")} />
                </Button>
            ) : (
                <Skeleton className="h-10 w-10 rounded-md" />
            )}
        </div>
      </header>
       <div className="flex-1 overflow-y-auto">
         <div className="container mx-auto p-4 md:p-8">
            <main>
              <div className="aspect-video relative w-full overflow-hidden rounded-lg bg-black shadow-2xl shadow-primary/10">
                {renderPlayer()}
              </div>
              <div className="mt-6 rounded-lg bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{channel.name}</h1>
                    <p className="mt-1 text-base text-primary">{channel.category}</p>
                  </div>
                  {streamLinks.length > 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSwitchStream}
                      disabled={isPlayerLoading}
                      className="w-9 shrink-0 p-0 sm:w-auto sm:px-3"
                    >
                      <SwitchCamera className="h-4 w-4" />
                      <span className="hidden sm:inline">Cambiar Fuente</span>
                    </Button>
                  )}
                </div>
                <Separator className="my-4"/>
                <p className="text-muted-foreground">{channel.description}</p>
              </div>
            </main>

            {relatedChannels.length > 0 && (
               <aside className="mt-12">
                  <h2 className="text-2xl font-bold tracking-tight">Más en {channel.category}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {relatedChannels.map((c, index) => <ChannelCard key={c.id} channel={c} index={index} />)}
                  </div>
              </aside>
            )}
         </div>
       </div>
    </div>
  );
});

export default ChannelView;
