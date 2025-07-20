
"use client";

import type { Movie } from "@/types";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import MovieHeroCard from "./movie-hero-card";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function MovieHero({ movies }: { movies: Movie[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInteractingRef = useRef(false);
    const isTransitioningRef = useRef(false);

    const processedMovies = useMemo(() => {
        if (movies.length <= 1) return movies;
        // Clone first and last items for infinite loop
        return [movies[movies.length - 1], ...movies, movies[0]];
    }, [movies]);

    const stopAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
    }, []);

    const startAutoScroll = useCallback(() => {
        stopAutoScroll();
        if (processedMovies.length <= 3) return; // No auto-scroll for 1 or fewer original items

        intervalRef.current = setInterval(() => {
            if (!isInteractingRef.current) {
                setCurrentIndex(prevIndex => prevIndex + 1);
            }
        }, 6000); // 6-second interval for a relaxed, premium feel
    }, [processedMovies.length, stopAutoScroll]);
    
    // Initial setup to jump to the first real slide without animation
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && processedMovies.length > 1) {
            const initialOffset = scrollContainer.children[1] as HTMLElement;
            if (initialOffset) {
                scrollContainer.scrollTo({ left: initialOffset.offsetLeft, behavior: 'instant' });
            }
        }
    }, [processedMovies]);

    // Effect to handle the smooth scrolling to the current slide
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isTransitioningRef.current || processedMovies.length <= 1) return;
        
        const targetIndex = currentIndex + 1; // +1 to account for the prepended clone
        const movieElement = scrollContainer.children[targetIndex] as HTMLElement;

        if (movieElement) {
            scrollContainer.scrollTo({
                left: movieElement.offsetLeft,
                behavior: 'smooth' // Using CSS for smooth scrolling
            });
        }
    }, [currentIndex, processedMovies.length]);


    // Effect to handle the "infinite" loop jump
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const handleTransitionEnd = () => {
            isTransitioningRef.current = false;

            if (currentIndex === movies.length) {
                isTransitioningRef.current = true;
                setCurrentIndex(0);
                const targetElement = scrollContainer.children[1] as HTMLElement;
                scrollContainer.scrollTo({ left: targetElement.offsetLeft, behavior: 'instant' });
            } 
            else if (currentIndex === -1) {
                isTransitioningRef.current = true;
                setCurrentIndex(movies.length - 1);
                const targetElement = scrollContainer.children[movies.length] as HTMLElement;
                scrollContainer.scrollTo({ left: targetElement.offsetLeft, behavior: 'instant' });
            }
        };
        
        // We use a timer because 'transitionend' event can be unreliable with scroll
        const timer = setTimeout(handleTransitionEnd, 700); // Duration should match the CSS transition

        return () => clearTimeout(timer);
    }, [currentIndex, movies.length]);


    // Effect to manage all user interactions and auto-scroll lifecycle
    useEffect(() => {
        startAutoScroll();
        const container = scrollRef.current;

        const onInteractionStart = () => {
            isInteractingRef.current = true;
            stopAutoScroll();
        };

        const onInteractionEnd = () => {
            isInteractingRef.current = false;
            startAutoScroll();
        };

        container?.addEventListener('touchstart', onInteractionStart, { passive: true });
        container?.addEventListener('touchend', onInteractionEnd, { passive: true });
        container?.addEventListener('mousedown', onInteractionStart, { passive: true });
        container?.addEventListener('mouseup', onInteractionEnd, { passive: true });
        container?.addEventListener('wheel', onInteractionStart, { passive: true });

        return () => {
            stopAutoScroll();
            container?.removeEventListener('touchstart', onInteractionStart);
            container?.removeEventListener('touchend', onInteractionEnd);
            container?.removeEventListener('mousedown', onInteractionStart);
            container?.removeEventListener('mouseup', onInteractionEnd);
            container?.removeEventListener('wheel', onInteractionStart);
        };
    }, [startAutoScroll, stopAutoScroll]);


    if (!movies || movies.length === 0) {
        return null;
    }

    const originalMovieCount = movies.length;

    return (
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-black">
             <div 
                ref={scrollRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {processedMovies.map((movie, index) => (
                    <Link 
                        key={`${movie.id}-${index}`} 
                        href={`/pelicula/${movie.id}`}
                        className="w-full h-full flex-shrink-0 snap-center block outline-none transition-transform duration-300 active:scale-[0.98]"
                        aria-label={`Ver ${movie.title}`}
                        draggable={false}
                    >
                        <MovieHeroCard movie={movie} isActive={currentIndex === (index - 1)} />
                    </Link>
                ))}
            </div>

            {originalMovieCount > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {movies.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                            className={cn(
                                "h-1.5 w-6 rounded-full transition-all duration-300",
                                index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                            )}
                            aria-label={`Ir a película ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
