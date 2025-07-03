"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, FastForward, Rewind, AlertCircle } from "lucide-react";
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
  
  // Animation State
  const [showRewind, setShowRewind] = useState(false);
  const [showForward, setShowForward] = useState(false);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current || error) return;
    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } catch (err) {
      console.error("Video play/pause failed:", err);
      setIsPlaying(false);
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
        if (document.exitFullscreen) await document.exitFullscreen();
        if (screen.orientation && typeof screen.orientation.unlock === "function") screen.orientation.unlock();
      }
    } catch (err) {
      console.error(`Fullscreen Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);
  
  const handleVideoClick = useCallback(() => {
    setShowControls(v => !v);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

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
      if (amount > 0) {
        setShowForward(true);
        setTimeout(() => setShowForward(false), 700);
      } else {
        setShowRewind(true);
        setTimeout(() => setShowRewind(false), 700);
      }
    }
  }, [duration]);

  // Main Effect for Player Setup and Listeners
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video || !player) return;

    // Event listeners
    const onPlay = () => { setIsPlaying(true); resetControlsTimeout(); };
    const onPause = () => { setIsPlaying(false); setShowControls(true); };
    const onVolumeChange = () => {
        if (!video) return;
        setIsMuted(video.muted);
    };
    const onWaiting = () => !isSeeking && setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onEnded = () => { setIsPlaying(false); setShowControls(true); };
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onTimeUpdate = () => !isSeeking && setProgress(video.currentTime);
    const onLoadedMetadata = () => { setDuration(video.duration); setIsLoading(false); };
    const onError = () => {
        if (!video.error) return;
        switch (video.error.code) {
          case video.error.MEDIA_ERR_ABORTED: setError("La reproducción de video fue abortada."); break;
          case video.error.MEDIA_ERR_NETWORK: setError("Ocurrió un error de red al cargar el video."); break;
          case video.error.MEDIA_ERR_DECODE: setError("Ocurrió un error al decodificar el video."); break;
          case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED: setError("El formato del video no es compatible o no se pudo encontrar."); break;
          default: setError("Ocurrió un error inesperado al reproducir el video."); break;
        }
        setIsLoading(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || e.ctrlKey || e.metaKey) return;
      
      switch(e.key.toLowerCase()) {
        case " ": case "k": e.preventDefault(); handlePlayPause(); break;
        case "f": e.preventDefault(); handleFullScreenToggle(); break;
        case "m": e.preventDefault(); handleMuteToggle(); break;
        case "arrowright": e.preventDefault(); seekBy(5); break;
        case "arrowleft": e.preventDefault(); seekBy(-5); break;
      }
    };

    // Attach listeners
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
    player.addEventListener("keydown", onKeyDown);

    // Initial setup
    resetControlsTimeout();
    video.play().catch(() => setIsPlaying(false)); 

    // Cleanup
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
      player.removeEventListener("keydown", onKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isSeeking, resetControlsTimeout, handlePlayPause, handleFullScreenToggle, handleMuteToggle, seekBy]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const timeWidth = duration >= 3600 ? "w-20" : "w-14";
  const areControlsVisible = showControls || !isPlaying || !!error;
  const backgroundImageUrl = backdropUrl || posterUrl;

  return (
    <div 
      ref={playerRef} 
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handleVideoClick}
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
        onDoubleClick={handleFullScreenToggle}
        playsInline
        autoPlay
        muted={isMuted}
      />
      
      {isFullScreen && (
          <>
            <div className="absolute left-0 top-0 h-full w-1/3 z-20" onDoubleClick={(e) => {e.stopPropagation(); seekBy(-10)}} />
            <div className="absolute right-0 top-0 h-full w-1/3 z-20" onDoubleClick={(e) => {e.stopPropagation(); seekBy(10)}} />
          </>
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
      
      {(showRewind || showForward) && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="flex items-center gap-2 text-white bg-black/40 p-4 rounded-full animate-fade-in-out">
                {showRewind && <Rewind className="w-8 h-8" />}
                {showForward && <FastForward className="w-8 h-8" />}
            </div>
        </div>
      )}

      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            className="bg-black/40 text-white rounded-full p-2 sm:p-4 backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Play video"
          >
            <Play size={64} className="fill-white pl-1" />
          </button>
        </div>
      )}
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-2 transition-all duration-300 ease-in-out",
          areControlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 pb-1 text-white">
            <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-1" aria-label={isMuted ? 'Quitar silencio' : 'Silenciar'}>
              <VolumeIcon size={24} />
            </button>
            
            {isFullScreen ? (
              <>
                <span className={cn("font-mono select-none text-center tabular-nums text-xs sm:text-sm", timeWidth)}>
                    {formatTime(progress)}
                </span>
                
                <Slider
                    value={[progress]}
                    max={duration || 1}
                    step={1}
                    onValueChange={handleSeek}
                    onValueChangeStart={() => setIsSeeking(true)}
                    onValueChangeEnd={() => setIsSeeking(false)}
                    className="w-full flex-1 cursor-pointer"
                    aria-label="Video progress bar"
                />

                <span className={cn("font-mono select-none text-center tabular-nums text-xs sm:text-sm", timeWidth)}>
                    {formatTime(duration)}
                </span>
              </>
            ) : (
                <div className="flex-1" />
            )}
            
            <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-1" aria-label={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
              {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
        </div>
      </div>
    </div>
  );
}
