
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle, Music4 } from "lucide-react";
import type { Radio } from "@/types";

type AudioPlayerProps = {
  radio: Radio;
  currentStreamUrl: string;
};

export default function AudioPlayer({ radio, currentStreamUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsInstanceRef = useRef<any | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || error) return;
    if (audio.paused) {
      audio.play().catch(err => {
        console.error("Play error:", err);
        setError("No se pudo iniciar la reproducción.");
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [error]);

  const handleMuteToggle = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!currentStreamUrl) {
      setIsLoading(false);
      setError("Transmisión no disponible.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    const setupPlayer = async () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }

      if (currentStreamUrl.includes('.m3u8')) {
        try {
          const Hls = (await import("hls.js")).default;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hlsInstanceRef.current = hls;
            hls.loadSource(currentStreamUrl);
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
        audio.src = currentStreamUrl;
        audio.load();
        audio.play().catch(() => setIsPlaying(false));
      }
    };

    setupPlayer();

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [currentStreamUrl]);

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
                onClick={handleMuteToggle}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted ? "Quitar silencio" : "Silenciar"}
            >
                <VolumeIcon className="h-6 w-6" />
            </button>
            <button
                onClick={handlePlayPause}
                className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:bg-muted disabled:text-muted-foreground"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
                disabled={isLoading || !!error}
            >
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : (isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />)}
            </button>
            <div className="w-6 h-6" /> 
        </div>
        
        <audio ref={audioRef} className="hidden" playsInline />
    </div>
  );
}
