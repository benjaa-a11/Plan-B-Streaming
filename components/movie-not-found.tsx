import { AlertTriangle, Home, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MovieNotFound() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center">
        <AlertTriangle className="mb-6 h-20 w-20 text-destructive/80" />
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Película No Encontrada
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Lo sentimos, no pudimos encontrar la película que estás buscando. Es
          posible que ya no esté disponible.
        </p>
        <p className="mt-2 text-muted-foreground">
          Te sugerimos volver al catálogo de películas.
        </p>
        <Button asChild className="mt-8">
          <Link href="/peliculas">
            <Film className="mr-2 h-4 w-4" />
            Volver a Películas
          </Link>
        </Button>
      </div>
    </div>
  );
}
