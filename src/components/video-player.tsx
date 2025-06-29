"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
};

const formatTime = (timeInSeconds: number, showHours: boolean = false): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return showHours ? "0:00:00" : "00:00";
  }

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (showHours) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};


export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } catch (error) {
       if (error instanceof Error && error.name === 'NotAllowedError') {
        console.warn("Autoplay was prevented.", error);
      } else if (error instanceof Error && error.name === 'AbortError') {
        // This is normal if the user interrupts play, e.g., by pausing quickly.
      } else {
        console.error("Video play failed:", error);
      }
      setIsPlaying(false);
    }
  }, []);
  
  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      const currentMuted = videoRef.current.muted;
      videoRef.current.muted = !currentMuted;
      if(currentMuted && videoRef.current.volume === 0) {
        videoRef.current.volume = 0.5;
      }
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false); // Video metadata is loaded, ready to show play button
    }
  };
  
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
        console.error(`Fullscreen Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);
  
  const hideControls = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowControls(false);
    }
  }, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  const handleVideoClick = useCallback(() => {
    setShowControls(true);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
        setIsPlaying(false);
        setShowControls(true);
    };
    const onVolumeChange = () => {
        if (video) setIsMuted(video.muted);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlaying = () => {
        setIsPlaying(true);
        setIsLoading(false);
        resetControlsTimeout();
    };
    const onEnded = () => {
        setIsPlaying(false);
        setShowControls(true);
    };

    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onKeyDown = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        e.preventDefault();
        switch(e.key.toLowerCase()) {
            case " ":
            case "k":
                handlePlayPause();
                break;
            case "f":
                handleFullScreenToggle();
                break;
            case "m":
                handleMuteToggle();
                break;
        }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    
    const playerEl = playerRef.current;
    document.addEventListener("fullscreenchange", onFullScreenChange);
    playerEl?.addEventListener("keydown", onKeyDown);

    resetControlsTimeout();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      playerEl?.removeEventListener("keydown", onKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout, handlePlayPause, handleFullScreenToggle, handleMuteToggle]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const showHours = duration >= 3600;

  return (
    <div 
      ref={playerRef} 
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={hideControls}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDoubleClick={handleFullScreenToggle}
        playsInline
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            className="bg-black/40 text-white rounded-full p-2 sm:p-4 backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Play video"
          >
            <Play size={64} className="fill-white pl-1" />
          </button>
        </div>
      )}
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-2",
          "transition-all duration-300 ease-in-out",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4 pb-1 text-white">
            <button onClick={handlePlayPause} className="hover:text-red-500 transition-colors p-1">
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <div className="text-xs sm:text-sm font-mono select-none flex items-center gap-1.5">
                <span>{formatTime(progress, showHours)}</span>
                <span className="text-white/70">/</span>
                <span>{formatTime(duration, showHours)}</span>
            </div>
            
            <div className="flex-1" />
            
            <button onClick={handleMuteToggle} className="hover:text-red-500 transition-colors p-1">
                <VolumeIcon size={28} />
            </button>
            
            <button onClick={handleFullScreenToggle} className="hover:text-red-500 transition-colors p-1">
              {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
            </button>
        </div>
      </div>
    </div>
  );
}
