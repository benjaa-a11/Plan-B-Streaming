import type { Radio } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Radio as RadioIcon, PlayCircle } from "lucide-react";
import { memo } from "react";

type RadioCardProps = {
  radio: Radio;
  index: number;
};

const RadioCard = memo(function RadioCard({ radio, index }: RadioCardProps) {
  return (
    <Link 
      href={`/radio/${radio.id}`} 
      className="group block outline-none rounded-lg overflow-hidden transition-all duration-300 bg-card border hover:shadow-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 animate-fade-in-up"
      title={radio.name}
      style={{ animationDelay: `${index * 40}ms` }}
    >
        <div className="aspect-square w-full relative bg-muted/50 flex items-center justify-center">
          
          <div className="absolute inset-0 z-10 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white/80 transform transition-transform duration-300 group-hover:scale-110" />
          </div>

          {radio.logoUrl ? (
            <Image
              src={radio.logoUrl}
              alt={`Logo de ${radio.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="radio logo"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                <RadioIcon className="h-10 w-10 text-muted-foreground/60" />
            </div>
          )}
        </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-foreground truncate">
          {radio.name}
        </h3>
         {radio.emisora && (
            <p className="text-sm text-muted-foreground">
                {radio.emisora}
            </p>
         )}
      </div>
    </Link>
  );
});

export default RadioCard;