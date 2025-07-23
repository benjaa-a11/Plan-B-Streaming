import { getMovieById, getSimilarMovies } from "@/lib/actions";
import MovieView from "@/components/movie-view";
import MovieNotFound from "@/components/movie-not-found";

export const revalidate = 0; // Force dynamic rendering to always fetch fresh data

export default async function MoviePage({ params }: { params: { id: string } }) {
  const movie = await getMovieById(params.id);

  if (!movie) {
    return <MovieNotFound />;
  }

  const similarMovies = await getSimilarMovies(movie.id, movie.category);
  
  return <MovieView movie={movie} similarMovies={similarMovies} />;
}
