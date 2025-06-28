'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';

type MovieFilterContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  allCategories: string[];
};

const MovieFilterContext = createContext<MovieFilterContextType | undefined>(undefined);

export function MovieFilterProvider({
  children,
  initialCategories = [],
}: {
  children: ReactNode;
  initialCategories: string[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const allCategories = useMemo(() => ['Todos', ...initialCategories], [initialCategories]);

  const value = {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allCategories,
  };

  return React.createElement(MovieFilterContext.Provider, { value }, children);
}

export function useMovieFilters() {
  const context = useContext(MovieFilterContext);
  if (context === undefined) {
    throw new Error('useMovieFilters must be used within a MovieFilterProvider');
  }
  return context;
}
