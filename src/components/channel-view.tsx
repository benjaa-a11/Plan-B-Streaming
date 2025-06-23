"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, SignalZero, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

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

const STREAM_LOAD_TIMEOUT = 12000; // 12 seconds

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
          // It's already an embed link, we just rebuild it to standardize params.
          videoId = urlObj.pathname.split('/')[2];
        } else if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        }
      } else if (urlObj.hostname === 'youtu.be') {
        // For youtu.be links, the ID is in the pathname.
        videoId = urlObj.pathname.substring(1).split('?')[0];
      }
    } catch (error) {
      // If URL parsing fails, it's not a standard URL. Assume it's a direct iframe src.
      return url;
    }
  
    if (videoId) {
      // Standardize the embed URL with desired parameters.
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
      embedUrl.searchParams.set('autoplay', '1');
      embedUrl.searchParams.set('modestbranding', '1');
      embedUrl.searchParams.set('iv_load_policy', '3');
      return embedUrl.toString();
    }
    
    // If it's not a recognized YouTube URL, return it as is.
    return url;
  };


export default function ChannelView({ channel, relatedChannels }: ChannelViewProps) {
  const { isFavorite, addFavorite, removeFavorite, isLoaded } = useFavorites();
  const { toast } = useToast();

  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [allStreamsFailed, setAllStreamsFailed] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isFav = isFavorite(channel.id);
  
  const streamLinks = useMemo(
    () => (channel.streamUrl || []).map(getStreamableUrl),
    [channel.streamUrl]
  );
  const currentStreamUrl = streamLinks[currentStreamIndex];

  useEffect(() => {
    // Reset everything when the channel changes
    setCurrentStreamIndex(0);
    setIsPlayerLoading(true);
    setAllStreamsFailed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [channel.id]);

  useEffect(() => {
    if (!streamLinks.length || !currentStreamUrl) {
      setIsPlayerLoading(false);
      setAllStreamsFailed(true);
      return;
    }

    setIsPlayerLoading(true);

    // Set a timeout to detect if the iframe fails to load
    timeoutRef.current = setTimeout(() => {
      if (currentStreamIndex < streamLinks.length - 1) {
        toast({
          title: "Señal débil",
          description: "Cambiando a una fuente alternativa...",
        });
        setCurrentStreamIndex(prev => prev + 1);
      } else {
        setAllStreamsFailed(true);
        setIsPlayerLoading(false);
      }
    }, STREAM_LOAD_TIMEOUT);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStreamIndex, streamLinks, channel.id, toast, currentStreamUrl]);

  const handleFavoriteClick = () => {
    if (isFav) {
      removeFavorite(channel.id);
    } else {
      addFavorite(channel.id);
    }
  };
  
  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlayerLoading(false);
    setAllStreamsFailed(false);
  };

  const renderPlayer = () => {
    if (allStreamsFailed) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-center">
          <SignalZero className="h-20 w-20 text-primary/50 mb-6" />
          <h2 className="text-2xl font-bold text-foreground">Señal no disponible temporalmente</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
              Lo sentimos, parece que la transmisión de este canal está experimentando problemas técnicos. Hemos intentado todas las fuentes disponibles sin éxito.
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
            {currentStreamIndex > 0 && <p className="text-sm text-muted-foreground">Intentando fuente {currentStreamIndex + 1}</p>}
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
                <h1 className="text-3xl font-bold tracking-tight">{channel.name}</h1>
                <p className="mt-1 text-base text-primary">{channel.category}</p>
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
}
