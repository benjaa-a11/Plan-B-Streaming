import { getMovies } from "@/lib/actions";
import MovieBrowser from "@/components/movie-browser";

export const revalidate = 3600; // Revalidate every hour

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <MovieBrowser movies={movies} />
    </div>
  );
}
