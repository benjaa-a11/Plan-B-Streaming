import type { Movie } from "@/types";
import MovieCard from "./movie-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type MovieShelfProps = {
  title: string;
  movies: Movie[];
  animationDelay?: number;
};

export default function MovieShelf({ title, movies, animationDelay = 0 }: MovieShelfProps) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 opacity-0 animate-fade-in-up" style={{ animationDelay: `${animationDelay}ms` }}>
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="relative">
        <ScrollArea className="scrollbar-hide">
          <div className="flex space-x-4 pb-4">
            {movies.map((movie, index) => (
              <div key={movie.id} className="w-36 sm:w-40 shrink-0">
                <MovieCard movie={movie} index={index} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
