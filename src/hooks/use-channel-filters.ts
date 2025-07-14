'use client';

import * as React from 'react';

type FilterContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  allCategories: string[];
};

const FilterContext = React.createContext<FilterContextType | undefined>(undefined);

export function ChannelFilterProvider({
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

  return React.createElement(FilterContext.Provider, { value }, children);
}

export function useChannelFilters() {
  const context = React.useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useChannelFilters must be used within a ChannelFilterProvider');
  }
  return context;
}
