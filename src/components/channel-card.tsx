import type { Channel } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Clapperboard, PlayCircle } from "lucide-react";
import { memo } from "react";

type ChannelCardProps = {
  channel: Channel;
  index: number;
};

const ChannelCard = memo(function ChannelCard({ channel, index }: ChannelCardProps) {
  return (
    <Link 
      href={`/canal/${channel.id}`} 
      className="group block outline-none rounded-lg overflow-hidden transition-all duration-300 bg-card border hover:shadow-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 animate-fade-in-up"
      title={channel.name}
      style={{ animationDelay: `${index * 40}ms` }}
    >
        <div className="aspect-video w-full relative bg-muted/50 flex items-center justify-center">
          
          <div className="absolute inset-0 z-10 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white/80 transform transition-transform duration-300 group-hover:scale-110" />
          </div>

          {channel.logoUrl ? (
            <Image
              unoptimized
              src={channel.logoUrl}
              alt={`Logo de ${channel.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
              data-ai-hint="channel logo"
              priority={index < 8}
            />
          ) : (
            <Clapperboard className="h-10 w-10 text-muted-foreground/60" />
          )}
        </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-foreground truncate">
          {channel.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {channel.category}
        </p>
      </div>
    </Link>
  );
});

export default ChannelCard;
