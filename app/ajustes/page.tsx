
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
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
import { Moon, Sun, Monitor, Trash2, Download, CheckCircle, AlertCircle, Info, Palette, Smartphone, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

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
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="mt-2 h-4 w-64 rounded-md" />
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full max-w-lg" />
                </div>
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const SettingsRow = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
        <div className="flex-grow">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="w-full shrink-0 sm:w-auto">{children}</div>
    </div>
);

const SettingsCard = ({ icon, title, description, children }: { icon: ReactNode, title: string, description: string, children: ReactNode }) => (
  <Card className="opacity-0 animate-fade-in-up">
    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
      <div className="flex-shrink-0 text-primary">{icon}</div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
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

  const handleClearData = () => {
    try {
      localStorage.removeItem('plan-b-favorites');
      localStorage.removeItem('plan-b-movie-favorites');
      localStorage.removeItem('plan-b-channel-history');
      
      toast({
        title: (
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Datos de la aplicación eliminados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tus favoritos e historial de vistas han sido borrados.
              </p>
            </div>
          </div>
        ),
      });
      // Give user time to read the toast before reloading
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to clear app data from localStorage", error);
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
      <div className="space-y-8">
        
        <SettingsCard
          icon={<Palette size={32} strokeWidth={1.5} />}
          title="Apariencia"
          description="Personaliza la combinación de colores y el aspecto visual de la aplicación."
        >
          <SettingsRow
            title="Tema"
            description="Selecciona entre claro, oscuro o el tema de tu sistema."
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
        </SettingsCard>

        <SettingsCard
          icon={<Smartphone size={32} strokeWidth={1.5} />}
          title="Aplicación"
          description="Instala la aplicación en tu dispositivo para un acceso más rápido y una mejor experiencia."
        >
          <SettingsRow
            title="Instalar Aplicación"
            description="Añade Plan B a tu pantalla de inicio como una aplicación."
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
        </SettingsCard>
        
        <SettingsCard
          icon={<Database size={32} strokeWidth={1.5} />}
          title="Datos de la Aplicación"
          description="Gestiona los datos de la aplicación almacenados en este dispositivo."
        >
          <SettingsRow
            title="Borrar datos de navegación"
            description="Elimina favoritos e historial de canales guardados localmente."
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
                      Esta acción es irreversible. Todos tus favoritos (canales y películas) y tu historial de visualización de canales serán eliminados de este dispositivo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleClearData}
                    >
                      Sí, borrar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </SettingsRow>
        </SettingsCard>
        
        <SettingsCard
          icon={<Info size={32} strokeWidth={1.5} />}
          title="Información"
          description="Detalles sobre la versión actual de la aplicación."
        >
           <div className="flex items-center gap-4 border-t pt-6">
             <div className="flex-grow">
                <h3 className="font-semibold text-foreground">Plan B Streaming</h3>
                <p className="text-sm text-muted-foreground">Versión 1.0.0 · Creado con ❤️ para la comunidad.</p>
             </div>
          </div>
        </SettingsCard>

      </div>
    </div>
  );
}

