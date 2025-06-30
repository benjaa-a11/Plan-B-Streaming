"use client";

import { useMemo } from "react";
import type { Movie } from "@/types";
import MovieCard from "./movie-card";
import { Clapperboard } from "lucide-react";
import { useMovieFilters } from "@/hooks/use-movie-filters";

type MovieBrowserProps = {
  movies: Movie[];
};

export default function MovieBrowser({
  movies,
}: MovieBrowserProps) {
  const { searchTerm, selectedCategory } = useMovieFilters();

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      if (!movie) return false;
      const matchesCategory =
        selectedCategory === "Todas" || movie.category?.includes(selectedCategory);
      const matchesSearch =
        (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (movie.synopsis?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [movies, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Clapperboard className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            No se encontraron películas
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Prueba a cambiar la categoría o utiliza un término de búsqueda diferente.
          </p>
        </div>
      )}
    </div>
  );
}
