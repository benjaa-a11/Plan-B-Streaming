"use client";

import Link from "next/link";
import { ArrowLeft, SwitchCamera } from "lucide-react";
import { useState } from "react";
import dynamic from 'next/dynamic';

import type { Radio } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RadioCard from "./radio-card";

const AudioPlayer = dynamic(() => import('@/components/audio-player'), {
  ssr: false
});

type RadioViewProps = {
  radio: Radio;
  otherRadios: Radio[];
};

export default function RadioView({ radio, otherRadios }: RadioViewProps) {
  const { toast } = useToast();
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);

  const streamLinks = radio.streamUrl || [];
  const currentStreamUrl = streamLinks[currentStreamIndex];

  const handleSwitchStream = () => {
    const nextIndex = (currentStreamIndex + 1) % streamLinks.length;
    setCurrentStreamIndex(nextIndex);
    toast({
      title: (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <SwitchCamera className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-foreground">Cambiando de señal</p>
            <p className="text-sm text-muted-foreground">
              Usando Opción <span className="font-bold text-foreground">{nextIndex + 1}</span> de <span className="font-bold text-foreground">{streamLinks.length}</span>
            </p>
          </div>
        </div>
      ),
      duration: 3000,
    });
  };

  return (
    <div className="flex h-dvh flex-col bg-muted/20">
        <header className="flex h-16 shrink-0 items-center border-b bg-background px-4 md:px-6 pt-safe-top">
            <Button variant="outline" size="icon" asChild>
                <Link href="/radio" aria-label="Volver a radios">
                <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
        </header>
        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-8">
                <AudioPlayer radio={radio} currentStreamUrl={currentStreamUrl} />

                {streamLinks.length > 1 && (
                    <div className="mt-6 flex justify-center">
                        <Button
                        variant="secondary"
                        onClick={handleSwitchStream}
                        >
                        <SwitchCamera className="h-4 w-4 sm:mr-2" />
                        <span>Cambiar Fuente ({currentStreamIndex + 1}/{streamLinks.length})</span>
                        </Button>
                    </div>
                )}

                {otherRadios.length > 0 && (
                <aside className="mt-12">
                    <h2 className="text-2xl font-bold tracking-tight">Otras Radios</h2>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {otherRadios.map((r, index) => <RadioCard key={r.id} radio={r} index={index} />)}
                    </div>
                </aside>
                )}
            </div>
        </main>
    </div>
  );
}
