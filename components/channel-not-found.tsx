import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ChannelNotFound() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center">
        <AlertTriangle className="mb-6 h-20 w-20 text-destructive/80" />
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Canal No Encontrado
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Lo sentimos, no pudimos encontrar el canal que estás buscando. Es
          posible que el enlace no sea correcto o que el canal ya no esté
          disponible.
        </p>
        <p className="mt-2 text-muted-foreground">
          Te sugerimos volver al inicio para explorar nuestra grilla de
          canales.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Volver a Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
