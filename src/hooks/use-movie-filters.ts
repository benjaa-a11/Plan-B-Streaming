'use client';

import * as React from 'react';

type MovieFilterContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  allCategories: string[];
};

const MovieFilterContext = React.createContext<MovieFilterContextType | undefined>(undefined);

export function MovieFilterProvider({
  children,
  initialCategories = [],
}: {
  children: React.ReactNode;
  initialCategories: string[];
}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');

  const allCategories = React.useMemo(() => ['Todos', ...initialCategories], [initialCategories]);

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
  const context = React.useContext(MovieFilterContext);
  if (context === undefined) {
    throw new Error('useMovieFilters must be used within a MovieFilterProvider');
  }
  return context;
}
