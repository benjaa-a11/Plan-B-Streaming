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
      className="group flex flex-col items-center gap-3 text-center outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg opacity-0 animate-fade-in-up"
      title={radio.name}
      style={{ animationDelay: `${index * 40}ms` }}
    >
        <div className="aspect-square w-full relative rounded-full overflow-hidden shadow-lg group-hover:shadow-primary/20 transition-shadow duration-300 border-2 border-transparent group-focus-visible:border-primary">
          
          <div className="absolute inset-0 z-10 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white/80 transform transition-transform duration-300 group-hover:scale-110" />
          </div>

          {radio.logoUrl ? (
            <Image
              src={radio.logoUrl}
              alt={`Logo de ${radio.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover bg-card"
              data-ai-hint="radio logo"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                <RadioIcon className="h-10 w-10 text-muted-foreground/60" />
            </div>
          )}
        </div>
      
      <div>
        <h3 className="font-semibold text-foreground truncate w-32 sm:w-40">
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
