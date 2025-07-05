"use client";

import { useMemo, useEffect } from "react";
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
  const { searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } = useMovieFilters();

  // By resetting the filters when the component unmounts, we ensure that
  // the user always sees the full list of movies when they navigate to this page,
  // without the jarring "flicker" of a client-side reset on page load.
  useEffect(() => {
    // This return function is the cleanup function, which runs on unmount.
    return () => {
      setSelectedCategory('Todos');
      setSearchTerm('');
    };
  }, [setSelectedCategory, setSearchTerm]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      if (!movie) return false;

      const matchesSearch =
        (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (movie.synopsis?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'Todos' ||
        (Array.isArray(movie.category) && movie.category.includes(selectedCategory));

      return matchesSearch && matchesCategory;
    });
  }, [movies, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredMovies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
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
