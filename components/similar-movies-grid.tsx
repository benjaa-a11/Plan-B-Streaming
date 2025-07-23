import type { Movie } from "@/types";
import MovieCard from "./movie-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type SimilarMoviesGridProps = {
  movies: Movie[];
};

export default function SimilarMoviesGrid({ movies }: SimilarMoviesGridProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-4 pb-4">
        {movies.map((movie, index) => (
          <div key={movie.id} className="w-36 sm:w-44 md:w-48">
             <MovieCard movie={movie} index={index} />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
