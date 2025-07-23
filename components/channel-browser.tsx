
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Channel } from "@/types";
import ChannelCard from "./channel-card";
import { Film } from "lucide-react";
import { useChannelFilters } from "@/hooks/use-channel-filters";
import { useChannelHistory } from "@/hooks/use-channel-history";

type ChannelBrowserProps = {
  channels: Channel[];
};

export default function ChannelBrowser({
  channels,
}: ChannelBrowserProps) {
  const { searchTerm, selectedCategory } = useChannelFilters();
  const { viewCounts, isLoaded } = useChannelHistory();
  const [clientChannels, setClientChannels] = useState<Channel[]>(channels);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      if (!channel) return false;
      const matchesCategory =
        selectedCategory === "Todos" || channel.category === selectedCategory;
      const matchesSearch =
        (channel.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (channel.description?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [channels, searchTerm, selectedCategory]);

  useEffect(() => {
    if (isLoaded && isMounted) {
      const sorted = [...filteredChannels].sort((a, b) => {
        const countA = viewCounts[a.id] || 0;
        const countB = viewCounts[b.id] || 0;
        return countB - countA;
      });
      setClientChannels(sorted);
    } else {
      setClientChannels(filteredChannels);
    }
  }, [filteredChannels, viewCounts, isLoaded, isMounted]);


  return (
    <div className="space-y-8">
      {clientChannels.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {clientChannels.map((channel, index) => (
            <ChannelCard key={channel.id} channel={channel} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Film className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            No se encontraron canales
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Prueba a cambiar la categoría o utiliza un término de búsqueda diferente.
          </p>
        </div>
      )}
    </div>
  );
}
