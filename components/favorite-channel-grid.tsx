"use client";

import { useState, useEffect } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import type { Channel } from '@/types';
import ChannelCard from '@/components/channel-card';
import { HeartOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getChannelsByIds } from '@/lib/actions';

function FavoritesLoading() {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="px-1 space-y-2">
                        <Skeleton className="h-5 w-3/4 rounded-md" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function FavoriteChannelGrid() {
  const { favorites, isLoaded: favoritesAreLoaded } = useFavorites();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!favoritesAreLoaded) {
      return;
    }

    if (favorites.length > 0) {
      setIsLoading(true);
      getChannelsByIds(favorites)
        .then(setChannels)
        .finally(() => setIsLoading(false));
    } else {
      setChannels([]);
      setIsLoading(false);
    }
  }, [favorites, favoritesAreLoaded]);

  if (isLoading) {
      return <FavoritesLoading />;
  }

  return (
    <>
      {channels.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {channels.map((channel, index) => (
            <ChannelCard key={channel.id} channel={channel} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <HeartOff className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            Aún no tienes favoritos
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Haz clic en el corazón de un canal para agregarlo aquí.
          </p>
        </div>
      )}
    </>
  );
}
