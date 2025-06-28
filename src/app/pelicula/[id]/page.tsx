import { getMovieById } from "@/lib/actions";
import MovieView from "@/components/movie-view";
import MovieNotFound from "@/components/movie-not-found";

export const revalidate = 3600; // Revalidate every hour

export default async function MoviePage({ params }: { params: { id: string } }) {
  const movie = await getMovieById(params.id);

  if (!movie) {
    return <MovieNotFound />;
  }
  
  return <MovieView movie={movie} />;
}
