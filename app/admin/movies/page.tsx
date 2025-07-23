import { getMovies } from "@/lib/actions";
import MovieDataTable from "@/components/admin/movie-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminMoviesPage() {
  // Fetch all movies for the admin panel. 
  // We include placeholders to allow editing them if the DB is empty.
  const movies = await getMovies(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Películas</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina las películas de la aplicación.
        </p>
      </div>
      <MovieDataTable data={movies} />
    </div>
  );
}

    