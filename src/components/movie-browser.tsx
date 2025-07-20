
"use client";

import { useMemo, useEffect } from "react";
import type { Movie } from "@/types";
import { useMovieFilters } from "@/hooks/use-movie-filters";
import MovieShelf from "./movie-shelf";
import MovieHero from "./movie-hero";
import { cn } from "@/lib/utils";
import MovieCard from "./movie-card";

type MovieBrowserProps = {
  movies: Movie[];
  isHomePage?: boolean;
};

type MoviesByCategory = {
  [category: string]: Movie[];
};

export default function MovieBrowser({
  movies,
  isHomePage = false,
}: MovieBrowserProps) {
  const { searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } = useMovieFilters();

  // Reset the filters every time the user navigates to this page.
  useEffect(() => {
    if (!isHomePage) {
      setSelectedCategory('Todos');
      setSearchTerm('');
    }
  }, [setSelectedCategory, setSearchTerm, isHomePage]);

  const { heroMovies, byCategory, allMoviesFiltered } = useMemo(() => {
    const filtered = isHomePage ? movies : movies.filter((movie) => 
        (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    const heroMovies = movies.filter(m => m.isHero).slice(0, 4);
    
    let categories: MoviesByCategory = {};
    if (!isHomePage && selectedCategory !== 'Todos') {
        categories = {
            [selectedCategory]: filtered.filter(movie => movie.category?.includes(selectedCategory))
        };
    } else {
        categories = filtered.reduce<MoviesByCategory>((acc, movie) => {
            if (movie.category && movie.category.length > 0) {
                movie.category.forEach(cat => {
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(movie);
                });
            }
            return acc;
        }, {});
    }

    return { 
      heroMovies,
      byCategory: categories,
      allMoviesFiltered: filtered,
    };
  }, [movies, searchTerm, selectedCategory, isHomePage]);
  
  const categories = useMemo(() => {
      if (searchTerm) {
          return []; // Do not show categories when searching
      }
      return Object.keys(byCategory).sort();
  }, [byCategory, searchTerm]);

  return (
    <div className="w-full relative bg-background text-foreground">
        {!isHomePage && heroMovies.length > 0 && selectedCategory === 'Todos' && searchTerm === '' && (
            <MovieHero movies={heroMovies} />
        )}
        
        <div className={cn(
            "space-y-12",
            isHomePage ? "pt-8" : "pt-8 pb-12",
            !isHomePage && "container mx-auto px-4 sm:px-6 lg:px-8"
        )}>
            {searchTerm ? (
                 <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Resultados de "{searchTerm}"</h2>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                      {allMoviesFiltered.map((movie, index) => (
                          <div key={movie.id} className="w-full shrink-0">
                            <MovieCard movie={movie} index={index} />
                          </div>
                      ))}
                    </div>
                </div>
            ) : (
                categories.map((category, index) => (
                    <MovieShelf 
                        key={category}
                        title={category}
                        movies={byCategory[category]}
                        animationDelay={index * 100}
                    />
                ))
            )}
        </div>
    </div>
  );
}
