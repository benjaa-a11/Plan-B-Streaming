"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LivePlayerProps = {
  src: string;
};

// This player is designed to be robust. It uses native HLS playback on supported
// browsers (like Safari) and falls back to hls.js on others (like Chrome).
// This provides the best stability and compatibility.

export default function LivePlayer({ src }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<any | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core effect for setting up and cleaning up the player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state for new source
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    const setupPlayer = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        
        // Destroy previous instance if it exists
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Use native HLS support
          video.src = src;
          // Events are handled by the general event listener effect
        } else if (Hls.isSupported()) {
          // Use hls.js
          const hls = new Hls({
            // Robust configuration
            startLevel: -1, // Start with auto level selection
            fragLoadErrorMaxRetry: 6,
            manifestLoadErrorMaxRetry: 4,
          });

          hlsInstanceRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error("HLS Fatal Error:", data);
              setError("No se pudo cargar la transmisión.");
              setIsLoading(false);
            }
          });
        } else {
          throw new Error("HLS not supported");
        }
      } catch (e) {
        console.error("Player setup error:", e);
        setError("Tu navegador no es compatible con esta transmisión.");
        setIsLoading(false);
      }
    };

    setupPlayer();

    // Cleanup on component unmount or src change
    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [src]);

  // General event listeners for player state updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsLoading(false); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(video.muted || video.volume === 0);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const onFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onError = () => {
        // Handle native video element errors
        if (!hlsInstanceRef.current) { // Only if not handled by hls.js
            setError("Ocurrió un error al reproducir el video.");
            setIsLoading(false);
        }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);
  
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
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
        await document.exitFullscreen();
        if (screen.orientation && typeof screen.orientation.unlock === "function") {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen Error:", err);
    }
  }, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const handlePlayerClick = useCallback(() => {
      if (!isPlaying) return;
      setShowControls(v => !v);
      resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);
  
  const handleMouseMove = useCallback(() => {
      setShowControls(true);
      resetControlsTimeout();
  }, [resetControlsTimeout]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const showCenterPlayButton = !isPlaying && !isLoading && !error;
  
  // Controls are visible if not playing, if there's an error, or if explicitly shown
  const areControlsVisible = !isPlaying || showControls || !!error;

  return (
    <div
      ref={playerRef}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onClick={handlePlayerClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onDoubleClick={handleFullScreenToggle}
    >
      <video ref={videoRef} className="max-h-full w-full object-contain" playsInline autoPlay muted={isMuted} />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {error && !isLoading && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-4 text-center pointer-events-none">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-white">Error de reproducción</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      )}
      
      {showCenterPlayButton && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            className="bg-black/50 text-white rounded-full p-4 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50"
            aria-label="Reproducir"
          >
            <Play className="h-10 w-10 fill-white pl-1" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-4 transition-all duration-300",
          areControlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent clicks on controls from bubbling up to the player
      >
        <div className="flex items-center gap-4 text-white">
          <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <Badge variant="destructive" className="font-semibold">EN VIVO</Badge>
          <div className="flex-1" />
          <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-1" aria-label={isMuted ? "Quitar silencio" : "Silenciar"}>
            <VolumeIcon size={28} />
          </button>
          <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-1" aria-label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}>
            {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
}
