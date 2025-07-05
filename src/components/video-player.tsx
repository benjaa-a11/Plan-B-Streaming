"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type VideoPlayerProps = {
  src: string;
  posterUrl: string;
  backdropUrl?: string;
};

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return "00:00";
  }
  const date = new Date(timeInSeconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export default function VideoPlayer({ src, posterUrl, backdropUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seekIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State Management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seekIndicator, setSeekIndicator] = useState<'forward' | 'backward' | null>(null);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current || error) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [error]);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);
  
  const handleFullScreenToggle = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (!document.fullscreenElement) {
        await player.requestFullscreen();
        if (screen.orientation && typeof screen.orientation.lock === "function") {
          await screen.orientation.lock("landscape").catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
        if (screen.orientation && typeof screen.orientation.unlock === "function") {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen Error:", err);
    }
  }, []);
  
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const seekBy = useCallback((amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + amount));
    }
  }, [duration]);
  
  const showSeekIndicator = useCallback((direction: 'forward' | 'backward') => {
      setSeekIndicator(direction);
      if (seekIndicatorTimeoutRef.current) clearTimeout(seekIndicatorTimeoutRef.current);
      seekIndicatorTimeoutRef.current = setTimeout(() => {
          setSeekIndicator(null);
      }, 700);
  }, []);

  const handlePlayerAreaClick = useCallback((e: React.MouseEvent) => {
    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        // Double click
        const rect = playerRef.current!.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 2) {
            seekBy(-10);
            showSeekIndicator('backward');
        } else {
            seekBy(10);
            showSeekIndicator('forward');
        }
    } else {
        clickTimeoutRef.current = setTimeout(() => {
            // Single click
            setShowControls(v => !v);
            resetControlsTimeout();
            clickTimeoutRef.current = null;
        }, 250);
    }
  }, [playerRef, seekBy, showSeekIndicator, resetControlsTimeout]);


  // Main Effect for Player Setup and Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(video.muted || video.volume === 0);
    const onWaiting = () => !isSeeking && setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onEnded = () => setIsPlaying(false);
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onTimeUpdate = () => !isSeeking && setProgress(video.currentTime);
    const onLoadedMetadata = () => { setDuration(video.duration); setIsLoading(false); };
    const onError = () => {
        if (!video.error) return;
        setError("Ocurrió un error al reproducir el video.");
        setIsLoading(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    document.addEventListener("fullscreenchange", onFullScreenChange);
    
    resetControlsTimeout();
    video.play().catch(() => setIsPlaying(false)); 

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (seekIndicatorTimeoutRef.current) clearTimeout(seekIndicatorTimeoutRef.current);
    };
  }, [isSeeking, resetControlsTimeout]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const areControlsVisible = showControls || !isPlaying || !!error;
  const backgroundImageUrl = backdropUrl || posterUrl;

  return (
    <div 
      ref={playerRef} 
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isLoading && backgroundImageUrl && !error && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={backgroundImageUrl} 
            alt="Movie backdrop" 
            fill 
            sizes="100vw"
            quality={50}
            priority
            className="object-cover blur-md scale-105 opacity-40"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className={cn("max-h-full w-full object-contain z-10", (isLoading || error) && "opacity-0")}
        onClick={handlePlayerAreaClick}
        onDoubleClick={(e) => e.preventDefault()}
        playsInline
      />
      
      {seekIndicator && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className={cn("bg-black/50 text-white rounded-full p-3 sm:p-4 backdrop-blur-sm animate-fade-in-out flex items-center gap-1", seekIndicator === 'backward' && "flex-row-reverse")}>
                  {seekIndicator === 'forward' ? <ChevronsRight className="h-8 w-8 sm:h-10 sm:w-10" /> : <ChevronsLeft className="h-8 w-8 sm:h-10 sm:w-10" />}
                  <span className="font-sans text-sm font-semibold">10s</span>
              </div>
          </div>
      )}

      {error && !isLoading && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-4 text-center pointer-events-none">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-white">Error de reproducción</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            className="bg-black/40 text-white rounded-full p-2 sm:p-4 backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Reproducir video"
          >
            <Play size={64} className="fill-white pl-1" />
          </button>
        </div>
      )}
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-4 transition-all duration-300 ease-in-out",
          areControlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center gap-2 text-white sm:gap-4">
          <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-1" aria-label={isMuted ? 'Quitar silencio' : 'Silenciar'}>
            <VolumeIcon size={28} />
          </button>

          {isFullScreen ? (
            <>
              <span className="font-sans select-none text-xs sm:text-sm tabular-nums w-16 text-right">{formatTime(progress)}</span>
              <Slider
                value={[progress]}
                max={duration || 1}
                step={1}
                onValueChange={handleSeek}
                onValueChangeStart={() => setIsSeeking(true)}
                onValueChangeEnd={() => setIsSeeking(false)}
                className="flex-1"
                aria-label="Barra de progreso del video"
              />
              <span className="font-sans select-none text-xs sm:text-sm tabular-nums w-16 text-left">{formatTime(duration)}</span>
            </>
          ) : (
             <div className="flex-1" />
          )}

          <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-1" aria-label={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
            {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
}
