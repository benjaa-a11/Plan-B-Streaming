"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Monitor, Trash2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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

// The event type is not standard in TS yet, so we define it.
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
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32 rounded-md" />
            <div className="space-y-2 mt-2">
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 rounded-md" />
            <div className="space-y-2 mt-2">
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 rounded-md" />
            <div className="space-y-2 mt-2">
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
      toast({
        title: (
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Favoritos eliminados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Los datos de tus canales favoritos han sido borrados.
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
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Personaliza el aspecto de la aplicación. Elige entre temas claro, oscuro o el de tu sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    "h-24 flex-col gap-2 justify-center text-lg font-semibold",
                    theme === option.value && "border-primary border-2 ring-2 ring-primary/30"
                  )}
                  onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                >
                  <option.icon className="h-6 w-6 mb-1" />
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instalar Aplicación</CardTitle>
            <CardDescription>
              Añade Plan B a tu pantalla de inicio para una experiencia más rápida y completa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStandalone ? (
              <div className="flex items-center gap-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-600 dark:text-green-400">
                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Aplicación Instalada</h4>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    Ya estás disfrutando de la experiencia de pantalla completa.
                  </p>
                </div>
              </div>
            ) : installPrompt ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold">Disponible para instalar</h4>
                  <p className="text-sm text-muted-foreground">
                    Acceso directo desde tu pantalla de inicio.
                  </p>
                </div>
                <Button onClick={handleInstallClick}>
                  <Download className="mr-2 h-4 w-4" />
                  Instalar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold text-muted-foreground">No disponible</h4>
                  <p className="text-sm text-muted-foreground">
                    La instalación no está disponible en este navegador o la app ya fue instalada.
                  </p>
                </div>
                <Button disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Instalar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos de la aplicación</CardTitle>
            <CardDescription>
              Administra los datos guardados en este dispositivo para mejorar el rendimiento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <h4 className="font-semibold text-destructive">Borrar datos de navegación</h4>
                <p className="text-sm text-muted-foreground">
                  Esto eliminará los datos guardados, como tus canales favoritos.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Borrar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. Todos tus canales favoritos serán eliminados de este dispositivo.
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
