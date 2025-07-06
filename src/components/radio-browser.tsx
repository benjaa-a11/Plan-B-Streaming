"use client";

import type { Radio } from "@/types";
import RadioCard from "./radio-card";
import { Radio as RadioIcon } from "lucide-react";

type RadioBrowserProps = {
  radios: Radio[];
};

export default function RadioBrowser({ radios }: RadioBrowserProps) {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Radios en Vivo</h1>
        <p className="mt-1 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">Sintoniza tus estaciones favoritas.</p>
      </div>

      {radios.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {radios.map((radio, index) => (
            <RadioCard key={radio.id} radio={radio} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <RadioIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            No se encontraron radios
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Actualmente no hay estaciones de radio disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
