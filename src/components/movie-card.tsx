import type { Movie } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { memo } from "react";

type MovieCardProps = {
  movie: Movie;
  index?: number;
};

const MovieCard = memo(function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <Link 
      href={`/pelicula/${movie.id}`} 
      className="group relative block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 animate-fade-in-up"
      title={movie.title}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="aspect-[2/3] w-full relative bg-muted/50 flex items-center justify-center">
        
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
            <Play className="h-12 w-12 fill-white text-white/90 drop-shadow-lg" />
        </div>

        <Image
          src={movie.posterUrl}
          alt={`Póster de ${movie.title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="movie poster"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-foreground truncate">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {movie.year}
        </p>
      </div>
    </Link>
  );
});

export default MovieCard;
