"use client";

import { useState, useEffect } from 'react';
import { useMovieFavorites } from '@/hooks/use-movie-favorites';
import type { Movie } from '@/types';
import MovieCard from '@/components/movie-card';
import { Clapperboard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getMoviesByIds } from '@/lib/actions';

function FavoritesLoading() {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                    <div className="px-1 space-y-2">
                        <Skeleton className="h-5 w-3/4 rounded-md" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function FavoriteMovieGrid() {
  const { favorites, isLoaded: favoritesAreLoaded } = useMovieFavorites();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!favoritesAreLoaded) {
      return;
    }

    if (favorites.length > 0) {
      setIsLoading(true);
      getMoviesByIds(favorites)
        .then(setMovies)
        .finally(() => setIsLoading(false));
    } else {
      setMovies([]);
      setIsLoading(false);
    }
  }, [favorites, favoritesAreLoaded]);

  if (isLoading) {
      return <FavoritesLoading />;
  }

  return (
    <>
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Clapperboard className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            Aún no tienes películas favoritas
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Toca el ícono de "Mi Lista" en una película para agregarla aquí.
          </p>
        </div>
      )}
    </>
  );
}
