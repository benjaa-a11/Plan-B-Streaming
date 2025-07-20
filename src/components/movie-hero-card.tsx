
"use client";

import type { Movie } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MovieHeroCardProps = {
    movie: Movie;
    isActive: boolean;
};

export default function MovieHeroCard({ movie, isActive }: MovieHeroCardProps) {
    const heroImage = movie.heroImageUrl || movie.backdropUrl || movie.posterUrl;
    
    return (
        <div className="relative w-full h-full">
            {/* Background Poster */}
            <Image 
                src={heroImage}
                alt={`Fondo para ${movie.title}`}
                fill
                sizes="100vw"
                className="object-cover transition-opacity duration-1000"
                priority
                unoptimized
                data-ai-hint="movie background"
            />
            
            {/* Content */}
            <div className={cn(
                "absolute inset-0 flex flex-col justify-end text-center md:text-left p-6 md:p-16",
                "transition-all duration-700 ease-in-out items-center md:items-start",
                isActive ? "opacity-100 " : "opacity-0"
            )}>
                 <div className="w-48 h-24 md:w-60 md:h-28 lg:w-80 lg:h-36 relative mb-4">
                     {movie.logoUrl && (
                         <Image
                            src={movie.logoUrl}
                            alt={`Logo de ${movie.title}`}
                            fill
                            sizes="(max-width: 768px) 192px, (max-width: 1024px) 240px, 320px"
                            className="object-contain drop-shadow-2xl"
                            unoptimized
                            data-ai-hint="movie logo"
                         />
                     )}
                 </div>
            </div>
        </div>
    )
}
