"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, SwitchCamera, VideoOff, Loader2 } from "lucide-react";
import { useState, useMemo, memo } from "react";
import dynamic from 'next/dynamic';

import type { Channel } from "@/types";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import ChannelCard from "@/components/channel-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const LivePlayer = dynamic(() => import('@/components/live-player'), {
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center"><Loader2 className="w-12 h-12 text-white animate-spin" /></div>,
  ssr: false
});

/**
 * Converts various YouTube URL formats into a standard embeddable URL.
 * This allows using regular YouTube links in the database.
 * @param url The original URL from the database.
 * @returns A standardized YouTube embed URL or the original URL if not a YouTube link.
 */
const getStreamableUrl = (url: string): string => {
    if (!url) return '';
    
    // Do not process m3u8 urls
    if (url.includes('.m3u8')) return url;
    
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

  const isFav = isLoaded ? isFavorite(channel.id) : false;
  
  const streamLinks = useMemo(
    () => (channel.streamUrl || []).map(getStreamableUrl),
    [channel.streamUrl]
  );
  const currentStreamUrl = streamLinks[currentStreamIndex];
  const isHls = currentStreamUrl?.includes('.m3u8');

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
      title: (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <SwitchCamera className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-foreground">Cambiando de señal</p>
            <p className="text-sm text-muted-foreground">
              Viendo Opción <span className="font-bold text-foreground">{nextIndex + 1}</span> de <span className="font-bold text-foreground">{streamLinks.length}</span>
            </p>
          </div>
        </div>
      ),
      duration: 3000,
    });
  };

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
                    <Image src={channel.logoUrl} alt={`Logo de ${channel.name}`} fill className="object-contain" sizes="40px"/>
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
                 {isHls ? (
                  <LivePlayer src={currentStreamUrl} />
                 ) : currentStreamUrl ? (
                  <iframe
                    key={currentStreamUrl}
                    src={currentStreamUrl}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                    title={`Reproductor de ${channel.name}`}
                  ></iframe>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-center">
                    <VideoOff className="h-20 w-20 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-bold">Transmisión no disponible</h3>
                    <p className="max-w-md text-muted-foreground">
                      Este canal no tiene una fuente de transmisión configurada.
                    </p>
                  </div>
                )}
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
                      className="w-9 shrink-0 p-0 sm:w-auto sm:px-3"
                    >
                      <SwitchCamera className="h-4 w-4 sm:mr-2" />
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
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
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
