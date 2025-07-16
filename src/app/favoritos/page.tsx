"use client";

import FavoriteChannelGrid from "@/components/favorite-channel-grid";
import FavoriteMovieGrid from "@/components/favorite-movie-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Film } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="channels">
            <Heart className="mr-2 h-4 w-4" />
            Canales
          </TabsTrigger>
          <TabsTrigger value="movies">
            <Film className="mr-2 h-4 w-4" />
            Películas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="channels" className="mt-6">
          <FavoriteChannelGrid />
        </TabsContent>
        <TabsContent value="movies" className="mt-6">
          <FavoriteMovieGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
