
'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, ListFilter } from 'lucide-react';
import { useMovieFilters } from '@/hooks/use-movie-filters';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from 'next/navigation';

export default function MovieHeader() {
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, allCategories } = useMovieFilters();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Reset filters when navigating away from the main movies page
    if (pathname !== '/peliculas') {
      setSearchTerm('');
      setSelectedCategory('Todos');
    }
  }, [pathname, setSearchTerm, setSelectedCategory]);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide header only if scrolling down and past a certain threshold
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm pt-safe-top transition-transform duration-300 ease-in-out",
        !isVisible && "-translate-y-full"
    )}>
       <div className="container flex h-16 items-center gap-2 md:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-10 pr-4 h-11 w-full text-base bg-card border-transparent rounded-full focus:bg-background focus:border-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar película"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger
            className="h-11 w-11 shrink-0 p-0 flex items-center justify-center bg-card border-transparent rounded-full"
            aria-label="Filtrar por categoría"
          >
            <ListFilter className="h-5 w-5 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            {allCategories.filter(c => c !== 'Todos').map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
