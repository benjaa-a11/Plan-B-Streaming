"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Monitor, Trash2, Download, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

function SettingsPageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <Skeleton className="h-10 w-48 rounded-md" />
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="mt-2 h-4 w-64 rounded-md" />
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full max-w-lg" />
                </div>
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SettingsRow = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-grow">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="w-full shrink-0 sm:w-auto">{children}</div>
    </div>
);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const themeOptions = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  const handleClearFavorites = () => {
    try {
      localStorage.removeItem('plan-b-favorites');
      localStorage.removeItem('plan-b-movie-favorites');
      toast({
        title: (
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Favoritos eliminados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Los datos de tus favoritos han sido borrados.
              </p>
            </div>
          </div>
        ),
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to clear favorites from localStorage", error);
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive-foreground">Error al borrar</p>
              <p className="text-sm text-destructive-foreground/80 mt-1">
                No se pudieron borrar los datos. Por favor, inténtalo de nuevo.
              </p>
            </div>
          </div>
        ),
      });
    }
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsStandalone(true);
    }
  };

  if (!isClient) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ajustes</h1>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Apariencia</h2>
          <Separator />
          <SettingsRow
            title="Tema"
            description="Personaliza el aspecto de la aplicación."
          >
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  className={cn(
                    "flex flex-col sm:flex-row items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                    theme === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/50"
                  )}
                  onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                >
                  <option.icon className="h-5 w-5" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </SettingsRow>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Aplicación</h2>
          <Separator />
          <SettingsRow
            title="Instalar Aplicación"
            description="Añade Plan B a tu pantalla de inicio para un acceso más rápido."
          >
            {isStandalone ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Instalada</span>
              </div>
            ) : installPrompt ? (
                <Button onClick={handleInstallClick}>
                  <Download className="mr-2 h-4 w-4" />
                  Instalar
                </Button>
            ) : (
                <Button disabled>
                  <Download className="mr-2 h-4 w-4" />
                  No disponible
                </Button>
            )}
          </SettingsRow>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Datos</h2>
           <Separator />
          <SettingsRow
            title="Borrar favoritos"
            description="Elimina todos los canales y películas guardados como favoritos en este dispositivo."
          >
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Borrar ahora
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. Todos tus canales y películas favoritas serán eliminados de este dispositivo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleClearFavorites}
                    >
                      Sí, borrar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </SettingsRow>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Información</h2>
          <Separator />
          <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
             <Info className="h-10 w-10 text-primary flex-shrink-0" />
             <div>
                <h3 className="font-semibold text-foreground">Plan B Streaming</h3>
                <p className="text-sm text-muted-foreground">Versión 1.0.0 · Creado con ❤️ para la comunidad.</p>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
