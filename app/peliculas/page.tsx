import { getMovies, getAppStatus } from "@/lib/actions";
import MovieBrowser from "@/components/movie-browser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Film } from "lucide-react";

export const dynamic = 'force-dynamic'; // Ensures the page is always rendered dynamically

export default async function MoviesPage() {
  const appStatus = await getAppStatus();
  
  if (appStatus?.disabledSections?.includes('peliculas')) {
    return (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center p-8">
             <Alert className="max-w-md">
                <Film className="h-4 w-4" />
                <AlertTitle>Sección en Mantenimiento</AlertTitle>
                <AlertDescription>
                    La sección de películas no está disponible en este momento. Estamos trabajando para mejorarla. ¡Vuelve pronto!
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  const movies = await getMovies(true); // Include placeholders in case db is empty

  return (
    <MovieBrowser movies={movies} />
  );
}
