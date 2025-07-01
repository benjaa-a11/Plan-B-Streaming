"use client";

import Link from "next/link";
import { ArrowLeft, VideoOff, Calendar, Clock, Star, User, Users } from "lucide-react";
import type { Movie } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VideoPlayer from "@/components/video-player";
import { Badge } from "@/components/ui/badge";

type MovieViewProps = {
  movie: Movie;
};

export default function MovieView({ movie }: MovieViewProps) {
  
  return (
    <div className="flex h-dvh w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 pt-safe-top">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/peliculas" aria-label="Volver a películas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold truncate">{movie.title}</h1>
          </div>
        </div>
      </header>
       <div className="flex-1 overflow-y-auto">
         <div className="container mx-auto p-4 md:p-8">
            <main>
              <div className="aspect-video relative w-full overflow-hidden rounded-lg bg-black shadow-2xl shadow-primary/10">
                {movie.format === 'mp4' && movie.streamUrl ? (
                   <VideoPlayer src={movie.streamUrl} posterUrl={movie.posterUrl} />
                ) : movie.streamUrl ? (
                  <iframe
                    key={movie.id}
                    src={movie.streamUrl}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                    title={`Reproductor de ${movie.title}`}
                  ></iframe>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-center">
                    <VideoOff className="h-20 w-20 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-bold">Contenido no disponible</h3>
                    <p className="max-w-md text-muted-foreground">
                      Esta película no tiene una fuente de transmisión configurada.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 rounded-lg bg-card p-6">
                 {movie.category?.length > 0 && (
                   <div className="flex flex-wrap items-center gap-2">
                      {movie.category.map((cat) => (
                         <Badge key={cat} variant="secondary">{cat}</Badge>
                      ))}
                   </div>
                 )}
                <h1 className="text-3xl font-bold tracking-tight mt-2">{movie.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                  {movie.year && (
                    <div className="flex items-center gap-2" title="Año de lanzamiento">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-foreground">{movie.year}</span>
                    </div>
                  )}
                  {movie.duration && movie.duration !== "N/A" && (
                    <div className="flex items-center gap-2" title="Duración">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-foreground">{movie.duration}</span>
                    </div>
                  )}
                  {movie.rating && movie.rating !== "N/A" && (
                    <div className="flex items-center gap-2" title={`Puntuación: ${movie.rating}`}>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-foreground">{movie.rating}</span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4"/>
                <p className="text-foreground/80 leading-relaxed">{movie.synopsis}</p>

                {(movie.director && movie.director !== "N/A") || (movie.actors && movie.actors !== "N/A") ? (
                  <>
                    <Separator className="my-4"/>
                    <div className="space-y-4 text-sm">
                      {movie.director && movie.director !== "N/A" && (
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <div>
                            <strong className="text-foreground">Dirección</strong>
                            <p className="text-muted-foreground">{movie.director}</p>
                          </div>
                        </div>
                      )}
                      {movie.actors && movie.actors !== "N/A" && (
                        <div className="flex items-start gap-3">
                          <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <div>
                            <strong className="text-foreground">Reparto</strong>
                            <p className="text-muted-foreground">{movie.actors}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </main>
         </div>
       </div>
    </div>
  );
}
