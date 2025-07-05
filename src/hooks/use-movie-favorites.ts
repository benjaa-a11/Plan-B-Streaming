"use client";

import { useState, useEffect, useCallback } from 'react';

const MOVIE_FAVORITES_KEY = 'plan-b-movie-favorites';

export function useMovieFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(MOVIE_FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading movie favorites from localStorage", error);
      setFavorites([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateLocalStorage = (newFavorites: string[]) => {
    try {
      localStorage.setItem(MOVIE_FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error saving movie favorites to localStorage", error);
    }
  };

  const addFavorite = useCallback((movieId: string) => {
    setFavorites(prev => {
      if (prev.includes(movieId)) return prev;
      const newFavorites = [...prev, movieId];
      updateLocalStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((movieId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(id => id !== movieId);
      updateLocalStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((movieId: string) => {
    return favorites.includes(movieId);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, isLoaded };
}
