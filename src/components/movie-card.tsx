import type { Movie } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { memo } from "react";

type MovieCardProps = {
  movie: Movie;
};

const MovieCard = memo(function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link 
      href={`/pelicula/${movie.id}`} 
      className="group block outline-none rounded-lg overflow-hidden transition-all duration-300 bg-card border hover:shadow-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      title={movie.title}
    >
      <div className="aspect-[2/3] w-full relative bg-muted/50 flex items-center justify-center">
        <div className="absolute inset-0 z-10 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <PlayCircle className="h-14 w-14 text-white/90 transform transition-transform duration-300 group-hover:scale-110" />
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
