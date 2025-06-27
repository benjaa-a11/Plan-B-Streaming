"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ListFilter, Settings, Heart } from "lucide-react";
import { useChannelFilters } from "@/hooks/use-channel-filters";
import { useState, useEffect } from "react";

const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-2"
    aria-label="Volver a la página de inicio"
  >
    <Image src="/icon.png" alt="Plan B Streaming Logo" width={32} height={32} />
  </Link>
);

function Filters() {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allCategories,
  } = useChannelFilters();

  return (
    <div className="flex w-full items-center gap-2 max-w-md mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-10 h-10 w-full text-sm bg-muted border-transparent focus:bg-background focus:border-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar canal"
        />
      </div>

      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger
          className="h-10 w-10 shrink-0 p-0 flex items-center justify-center bg-muted border-transparent focus:bg-background focus:border-input"
          aria-label="Filtrar por categoría"
        >
          <ListFilter className="h-5 w-5 text-muted-foreground" />
        </SelectTrigger>
        <SelectContent>
          {allCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const HeaderContent = () => {
  const pathname = usePathname();

  if (pathname === "/") {
    return <Filters />;
  }
  if (pathname.startsWith('/favoritos')) {
    return (
      <div className="flex items-center gap-3 w-full justify-center md:justify-start">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">Mis Favoritos</h1>
      </div>
    );
  }
  if (pathname.startsWith('/ajustes')) {
    return (
      <div className="flex items-center gap-3 w-full justify-center md:justify-start">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">Ajustes</h1>
      </div>
    );
  }
  return null;
}

export default function Header() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <header className="sticky top-0 z-40 w-full h-16 border-b border-border/40 bg-background/95 backdrop-blur-sm" />;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm pt-safe-top">
      <div className="container flex h-16 items-center gap-4">
        {pathname === "/" && (
          <div className="flex-none">
            <Logo />
          </div>
        )}

        <div className="flex flex-1 items-center">
          <HeaderContent />
        </div>
        
        <div className="flex-none">
            <nav className="hidden items-center md:flex">
              <Button asChild variant={pathname.startsWith('/favoritos') ? "secondary" : "ghost"}>
                <Link href="/favoritos">
                  <Heart className="h-5 w-5 mr-2" />
                  Favoritos
                </Link>
              </Button>
              <Button asChild variant={pathname.startsWith('/ajustes') ? "secondary" : "ghost"}>
                <Link href="/ajustes">
                  <Settings className="h-5 w-5 mr-2" />
                  Ajustes
                </Link>
              </Button>
            </nav>
        </div>
      </div>
    </header>
  );
}
