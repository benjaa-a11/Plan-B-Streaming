
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle, Music4, SkipBack, SkipForward } from "lucide-react";
import type { Radio } from "@/types";

type AudioPlayerProps = {
  radio: Radio;
  currentStreamUrl: string;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export default function AudioPlayer({ radio, currentStreamUrl, onNext, onPrev, isFirst, isLast }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsInstanceRef = useRef<any | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupPlayer = useCallback(async (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoading(true);
      setError(null);
      
      // Stop and detach any existing player instance
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
      if (!audio.paused) {
          audio.pause();
      }
      audio.src = '';
      audio.load();

      if (!url) {
        setIsLoading(false);
        setError("Transmisión no disponible.");
        return;
      }

      if (url.includes('.m3u8')) {
        try {
          const Hls = (await import("hls.js")).default;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hlsInstanceRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(audio);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              audio.play().catch(() => setIsPlaying(false));
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                console.error("HLS Error:", data);
                setError("Error en la transmisión. Intente otra fuente.");
                setIsLoading(false);
              }
            });
          } else {
            throw new Error("HLS not supported");
          }
        } catch (e) {
          console.error("HLS setup error:", e);
          setError("Tu navegador no es compatible con esta transmisión.");
          setIsLoading(false);
        }
      } else { // MP3 or other direct formats
        audio.src = url;
        audio.load();
        audio.play().catch(() => setIsPlaying(false));
      }
    }, []);


  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (audio.paused) {
      // If paused, reload the source to get the live stream instead of continuing
      setupPlayer(currentStreamUrl);
    } else {
      audio.pause();
    }
  }, [error, currentStreamUrl, setupPlayer]);

  const handleMuteToggle = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  }, []);

  useEffect(() => {
    setupPlayer(currentStreamUrl);

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [currentStreamUrl, setupPlayer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => { setIsPlaying(true); setIsLoading(false); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(audio.muted || audio.volume === 0);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlaying = () => { setIsLoading(false); };
    const onError = () => {
        if (audio.error && !error) {
            setError("Ocurrió un error al reproducir el audio.");
            setIsLoading(false);
        }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("volumechange", onVolumeChange);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("volumechange", onVolumeChange);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
    };
  }, [error]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;

  return (
    <div className="w-full max-w-md mx-auto rounded-xl bg-card text-card-foreground shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="relative aspect-square w-full">
            {radio.logoUrl && (
                <Image 
                    src={radio.logoUrl}
                    alt={`Fondo para ${radio.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover blur-xl scale-110 opacity-30"
                    unoptimized
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-lg overflow-hidden shadow-2xl">
                    {radio.logoUrl ? (
                        <Image 
                            src={radio.logoUrl}
                            alt={`Logo de ${radio.name}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain"
                            unoptimized
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Music4 className="w-20 h-20 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="p-6 text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{radio.name}</h1>
            {radio.emisora && (
                <p className="text-lg text-muted-foreground font-medium">{radio.emisora}</p>
            )}
             {isPlaying && !isLoading && (
                <p className="text-sm text-primary animate-pulse font-medium">Transmitiendo en vivo</p>
             )}
             {!isPlaying && !isLoading && !error && (
                <p className="text-sm text-muted-foreground">Pausado</p>
             )}
              {isLoading && !error && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Conectando...
                </p>
             )}
             {error && (
                <p className="text-sm text-destructive flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
             )}
        </div>

        <div className="bg-muted/50 p-4 flex items-center justify-center gap-6">
            <button 
                onClick={onPrev}
                disabled={isFirst}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Radio anterior"
            >
                <SkipBack className="h-6 w-6" />
            </button>
            <button
                onClick={handlePlayPause}
                className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:bg-muted disabled:text-muted-foreground"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
                disabled={isLoading || !!error}
            >
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : (isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />)}
            </button>
             <button 
                onClick={onNext}
                disabled={isLast}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Siguiente radio"
            >
                <SkipForward className="h-6 w-6" />
            </button>
        </div>
        
        <audio ref={audioRef} className="hidden" playsInline />
    </div>
  );
}
