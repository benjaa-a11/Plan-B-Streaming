
"use server";

import { cache } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId, Timestamp, collectionGroup } from "firebase/firestore";
import type { Channel, Match, ChannelOption, Movie, Radio } from "@/types";
import { placeholderChannels, placeholderMovies, placeholderMatches, placeholderRadios } from "./placeholder-data";

// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  return placeholderChannels;
};

// Uncached version of getChannels to ensure data is always fresh
export const getChannels = async (): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(query(channelsCollection));
    
    if (channelSnapshot.empty) {
      return useFallbackData();
    }
    
    const channels = channelSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Channel));
    
    return channels;
  } catch (error) {
    console.error("Error al obtener canales de Firebase:", error);
    return useFallbackData();
  }
};

export const getChannelById = async (id: string): Promise<Channel | null> => {
  try {
    const channelDoc = doc(db, "channels", id);
    const channelSnapshot = await getDoc(channelDoc);

    if (channelSnapshot.exists()) {
      return { id: channelSnapshot.id, ...channelSnapshot.data() } as Channel;
    } else {
       // Fallback for demo purposes if ID not in firestore
      const fallbackChannel = placeholderChannels.find(c => c.id === id);
      if (fallbackChannel) {
        console.warn(`Canal con id ${id} no encontrado en Firebase. Usando dato de demostración.`);
        return fallbackChannel;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener canal con id ${id}:`, error);
     const fallbackChannel = placeholderChannels.find(c => c.id === id);
      if (fallbackChannel) {
        return fallbackChannel;
      }
    return null;
  }
};

export const getChannelsByIds = async (ids: string[]): Promise<Channel[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    // Firestore 'in' query is limited to 30 elements, so we chunk the IDs.
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        chunks.push(ids.slice(i, i + 30));
    }

    const firestoreChannels: Channel[] = [];
    for (const chunk of chunks) {
        const q = query(collection(db, "channels"), where(documentId(), "in", chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            firestoreChannels.push({ id: doc.id, ...doc.data() } as Channel);
        });
    }
    
    // To preserve the original order of IDs from the input array
    const firestoreChannelMap = new Map(firestoreChannels.map(c => [c.id, c]));
    return ids.map(id => firestoreChannelMap.get(id)).filter((c): c is Channel => !!c);

  } catch (error) {
    console.error("Error fetching channels by IDs from Firebase:", error);
    // Fallback to placeholder data for any matching IDs
    const allPlaceholderChannels = await getChannels();
    const placeholderMap = new Map(allPlaceholderChannels.map(c => [c.id, c]));
    return ids.map(id => placeholderMap.get(id)).filter((c): c is Channel => !!c);
  }
};

export const getCategories = async (): Promise<string[]> => {
  const channels = await getChannels();
  const categories = new Set(channels.map(channel => channel.category));
  return Array.from(categories).sort();
};

export const getChannelsByCategory = async (category: string, excludeId?: string): Promise<Channel[]> => {
  const allChannels = await getChannels();
  return allChannels.filter(channel => {
    const isSameCategory = channel.category === category;
    const isNotExcluded = excludeId ? channel.id !== excludeId : true;
    return isSameCategory && isNotExcluded;
  }).slice(0, 4); // Return a max of 4 related channels
};

export const getAgendaMatches = async (): Promise<Match[]> => {
  try {
    const now = new Date();
    const timeZone = 'America/Argentina/Buenos_Aires';
    
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')!.value, 10);
    const month = parseInt(parts.find(p => p.type === 'month')!.value, 10);
    const day = parseInt(parts.find(p => p.type === 'day')!.value, 10);
    
    const startOfTodayUTC = new Date(Date.UTC(year, month - 1, day, 3, 0, 0)); 
    const endOfTodayUTC = new Date(Date.UTC(year, month - 1, day + 1, 3, 0, 0));

    const agendaQuery = query(
        collection(db, "agenda"),
        where("time", ">=", Timestamp.fromDate(startOfTodayUTC)),
        where("time", "<", Timestamp.fromDate(endOfTodayUTC))
    );
    const agendaSnapshot = await getDocs(agendaQuery);

    const rawMatches = agendaSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(data => {
            const matchTimestamp = (data.time as Timestamp).toDate();
            const timeSinceStart = now.getTime() - matchTimestamp.getTime();
            return timeSinceStart <= (180 * 60 * 1000); 
        });

    if (rawMatches.length === 0) {
        console.warn("No matches found in Firebase for today. Using placeholder data.");
        return placeholderMatches;
    }
    
    const teamIds = new Set<string>();
    const tournamentIds = new Set<string>();
    const channelIds = new Set<string>();
    
    const extractId = (field: any): string | undefined => {
      if (!field) return undefined;
      return typeof field === 'string' ? field : field.id;
    };

    rawMatches.forEach(match => {
        const team1Id = extractId(match.team1);
        const team2Id = extractId(match.team2);
        const tournamentId = extractId(match.tournamentId);

        if (team1Id) teamIds.add(team1Id);
        if (team2Id) teamIds.add(team2Id);
        if (tournamentId) tournamentIds.add(tournamentId);
        if (match.channels) match.channels.forEach((c: string) => channelIds.add(c));
    });

    // Fetch all related data in parallel
    const teamsPromise = getDocs(collectionGroup(db, 'clubs'));
    
    const tournamentPromises = [];
    const tournamentIdsArray = Array.from(tournamentIds);
    for (let i = 0; i < tournamentIdsArray.length; i += 30) {
        const chunk = tournamentIdsArray.slice(i, i + 30);
        if (chunk.length > 0) {
            tournamentPromises.push(getDocs(query(collection(db, 'tournaments'), where("id", "in", chunk))));
        }
    }
    const tournamentsPromise = Promise.all(tournamentPromises);

    const channelsPromise = getChannelsByIds(Array.from(channelIds));

    const [teamsSnapshot, tournamentSnapshots, channels] = await Promise.all([
        teamsPromise,
        tournamentsPromise,
        channelsPromise
    ]);

    // Create maps for efficient lookup
    const teamsMap = new Map(teamsSnapshot.docs.map(doc => [doc.id, doc.data()]));

    const tournamentDocs = tournamentSnapshots.flatMap(snap => snap.docs);
    const tournamentsMap = new Map(tournamentDocs.map(doc => [doc.data().id, doc.data()]));
    const channelsMap = new Map(channels.map(c => [c.id, { id: c.id, name: c.name, logoUrl: c.logoUrl }]));
    
    const allMatches: Match[] = rawMatches.map(data => {
        const matchTimestamp = (data.time as Timestamp).toDate();
        
        const team1Id = extractId(data.team1);
        const team2Id = extractId(data.team2);
        const tournamentId = extractId(data.tournamentId);

        const team1Data = teamsMap.get(team1Id);
        const team2Data = teamsMap.get(team2Id);
        const tournamentData = tournamentsMap.get(tournamentId);

        let tournamentLogo: Match['tournamentLogo'] = undefined;
        if (tournamentData?.logoUrl) {
            if (Array.isArray(tournamentData.logoUrl) && tournamentData.logoUrl.length > 1) {
                tournamentLogo = { dark: tournamentData.logoUrl[0], light: tournamentData.logoUrl[1] };
            } else if (Array.isArray(tournamentData.logoUrl) && tournamentData.logoUrl.length === 1) {
                tournamentLogo = tournamentData.logoUrl[0];
            } else if (typeof tournamentData.logoUrl === 'string') {
                tournamentLogo = tournamentData.logoUrl;
            }
        }

        const channelOptions: ChannelOption[] = (data.channels || []).map((id: string) =>
            channelsMap.get(id)
        ).filter((c: ChannelOption | undefined): c is ChannelOption => !!c);

        const isLive = now.getTime() >= matchTimestamp.getTime();
        const isWatchable = matchTimestamp.getTime() - now.getTime() <= (30 * 60 * 1000);

        return {
            id: data.id,
            team1: team1Data?.name || 'Equipo A',
            team1Logo: team1Data?.logoUrl,
            team2: team2Data?.name || 'Equipo B',
            team2Logo: team2Data?.logoUrl,
            time: matchTimestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires', hour12: false }),
            isLive: isLive,
            isWatchable: isWatchable,
            channels: channelOptions,
            dates: data.dates,
            matchTimestamp: matchTimestamp,
            tournamentName: tournamentData?.name,
            tournamentLogo: tournamentLogo,
        };
    });

    return allMatches.sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());

  } catch (error) {
    console.error("Error al obtener partidos de la agenda:", error);
    return placeholderMatches;
  }
};


// --- MOVIES ---

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const _fetchTMDbData = cache(async (tmdbID: string) => {
  if (!tmdbID || !TMDB_API_KEY) return null;
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}?api_key=${TMDB_API_KEY}&language=es-ES`);
    if (!response.ok) {
      console.error(`Error fetching TMDb data for ${tmdbID}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.success === false) {
      console.error(`TMDb API error for ${tmdbID}: ${data.status_message}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching from TMDb for ${tmdbID}:`, error);
    return null;
  }
});

const _fetchTMDbCredits = cache(async (tmdbID: string) => {
  if (!tmdbID || !TMDB_API_KEY) return null;
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}/credits?api_key=${TMDB_API_KEY}&language=es-ES`);
    if (!response.ok) {
      console.error(`Error fetching TMDb credits for ${tmdbID}: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching credits from TMDb for ${tmdbID}:`, error);
    return null;
  }
});

const _fetchTMDbVideos = cache(async (tmdbID: string) => {
  if (!tmdbID || !TMDB_API_KEY) return null;
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}/videos?api_key=${TMDB_API_KEY}&language=es-ES,en-US`);
    if (!response.ok) {
      console.error(`Error fetching TMDb videos for ${tmdbID}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Prioritize official trailers in Spanish, then English, then any trailer
      const trailers = data.results.filter((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
      const officialSpanishTrailer = trailers.find((v: any) => v.iso_639_1 === 'es' && v.official);
      const spanishTrailer = trailers.find((v: any) => v.iso_639_1 === 'es');
      const officialEnglishTrailer = trailers.find((v: any) => v.official);
      const anyTrailer = trailers[0];

      const bestTrailer = officialSpanishTrailer || spanishTrailer || officialEnglishTrailer || anyTrailer;
      return bestTrailer ? `https://www.youtube.com/embed/${bestTrailer.key}` : null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching videos from TMDb for ${tmdbID}:`, error);
    return null;
  }
});


const _enrichMovieData = async (docId: string, firestoreMovie: any): Promise<Movie> => {
  if (firestoreMovie.tmdbID) {
    const [movieData, creditsData, videoUrl] = await Promise.all([
      _fetchTMDbData(firestoreMovie.tmdbID),
      _fetchTMDbCredits(firestoreMovie.tmdbID),
      _fetchTMDbVideos(firestoreMovie.tmdbID),
    ]);

    if (movieData) {
      // Format duration
      let finalDuration = firestoreMovie.duration;
      if (!finalDuration && movieData.runtime) {
        const hours = Math.floor(movieData.runtime / 60);
        const minutes = movieData.runtime % 60;
        if (hours > 0) {
          finalDuration = `${hours}h ${minutes}m`;
        } else {
          finalDuration = `${minutes}m`;
        }
      }

      // Get director and actors from credits
      const director = creditsData?.crew?.find((person: any) => person.job === 'Director')?.name;
      const actors = creditsData?.cast?.slice(0, 3).map((person: any) => person.name).join(', ');

      return {
        id: docId,
        tmdbID: firestoreMovie.tmdbID,
        title: firestoreMovie.title || movieData.title,
        posterUrl: firestoreMovie.posterUrl || (movieData.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieData.poster_path}` : 'https://placehold.co/500x750.png'),
        backdropUrl: movieData.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${movieData.backdrop_path}` : undefined,
        streamUrl: firestoreMovie.streamUrl,
        trailerUrl: videoUrl,
        category: firestoreMovie.category || movieData.genres?.map((g: any) => g.name) || [],
        synopsis: firestoreMovie.synopsis || movieData.overview,
        year: firestoreMovie.year || (movieData.release_date ? parseInt(movieData.release_date.split('-')[0], 10) : undefined),
        duration: finalDuration || "N/A",
        format: firestoreMovie.format,
        director: firestoreMovie.director || director,
        actors: firestoreMovie.actors || actors,
        rating: firestoreMovie.rating || (movieData.vote_average ? movieData.vote_average.toFixed(1) : undefined),
      };
    }
  }
  // Fallback to Firestore data if no tmdbID or API fetch fails
  return {
    id: docId,
    ...firestoreMovie,
  } as Movie;
};


const useMovieFallbackData = () => {
  console.warn("Firebase no disponible o colección de películas vacía. Usando datos de demostración.");
  return placeholderMovies;
};

// Uncached version of getMovies to ensure data is always fresh
export const getMovies = async (): Promise<Movie[]> => {
  try {
    const moviesCollection = collection(db, "peliculas");
    const movieSnapshot = await getDocs(query(moviesCollection));
    
    if (movieSnapshot.empty) {
      return useMovieFallbackData();
    }
    
    const moviePromises = movieSnapshot.docs.map(doc => _enrichMovieData(doc.id, doc.data()));
    const movies = await Promise.all(moviePromises);

    return movies;
  } catch (error) {
    console.error("Error al obtener películas de Firebase:", error);
    return useMovieFallbackData();
  }
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const movieDoc = doc(db, "peliculas", id);
    const movieSnapshot = await getDoc(movieDoc);

    if (movieSnapshot.exists()) {
      return await _enrichMovieData(movieSnapshot.id, movieSnapshot.data());
    } else {
      const fallbackMovie = placeholderMovies.find(m => m.id === id);
      if (fallbackMovie) {
        console.warn(`Película con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
        return fallbackMovie;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener película con id ${id}:`, error);
    const fallbackMovie = placeholderMovies.find(m => m.id === id);
    if (fallbackMovie) {
      return fallbackMovie;
    }
    return null;
  }
};

export const getMoviesByIds = async (ids: string[]): Promise<Movie[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        chunks.push(ids.slice(i, i + 30));
    }

    const firestoreMoviesData: {id: string, data: any}[] = [];
    for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const q = query(collection(db, "peliculas"), where(documentId(), "in", chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            firestoreMoviesData.push({ id: doc.id, data: doc.data() });
        });
    }
    
    if (firestoreMoviesData.length === 0) {
        // Fallback for demo purposes if IDs not in firestore
        const allPlaceholderMovies = await getMovies();
        const placeholderMap = new Map(allPlaceholderMovies.map(m => [m.id, m]));
        return ids.map(id => placeholderMap.get(id)).filter((m): m is Movie => !!m);
    }

    const enrichedMovies = await Promise.all(
        firestoreMoviesData.map(movie => _enrichMovieData(movie.id, movie.data))
    );

    // Preserve original order
    const movieMap = new Map(enrichedMovies.map(m => [m.id, m]));
    return ids.map(id => movieMap.get(id)).filter((m): m is Movie => !!m);

  } catch (error) {
    console.error("Error fetching movies by IDs from Firebase:", error);
    // Fallback to placeholder data for any matching IDs
    const allPlaceholderMovies = await getMovies();
    const placeholderMap = new Map(allPlaceholderMovies.map(m => [m.id, m]));
    return ids.map(id => placeholderMap.get(id)).filter((m): m is Movie => !!m);
  }
};

export const getMovieCategories = async (): Promise<string[]> => {
  const movies = await getMovies();
  if (!movies || movies.length === 0) return [];
  const categories = new Set(movies.flatMap(movie => movie.category || []));
  return Array.from(categories).sort();
};

export const getSimilarMovies = async (currentMovieId: string, categories: string[] = [], limit: number = 10): Promise<Movie[]> => {
  if (!categories || categories.length === 0) {
    return [];
  }
  
  try {
    const allMovies = await getMovies();
    const similar = allMovies
      .filter(movie => 
        movie.id !== currentMovieId && 
        movie.category?.some(cat => categories.includes(cat))
      )
      .slice(0, limit);
    return similar;
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
};


// --- RADIOS ---

const useRadioFallbackData = () => {
  console.warn("Firebase no disponible o colección de radios vacía. Usando datos de demostración.");
  return placeholderRadios;
};

export const getRadios = async (): Promise<Radio[]> => {
  try {
    const radiosCollection = collection(db, "radio");
    const radioSnapshot = await getDocs(query(radiosCollection));
    
    if (radioSnapshot.empty) {
      return useRadioFallbackData();
    }
    
    const radios = radioSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Radio));
    
    return radios;
  } catch (error) {
    console.error("Error al obtener radios de Firebase:", error);
    return useRadioFallbackData();
  }
};

export const getRadioById = async (id: string): Promise<Radio | null> => {
  try {
    const radioDoc = doc(db, "radio", id);
    const radioSnapshot = await getDoc(radioDoc);

    if (radioSnapshot.exists()) {
      return { id: radioSnapshot.id, ...radioSnapshot.data() } as Radio;
    } else {
      const fallbackRadio = placeholderRadios.find(r => r.id === id);
      if (fallbackRadio) {
        console.warn(`Radio con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
        return fallbackRadio;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener radio con id ${id}:`, error);
    const fallbackRadio = placeholderRadios.find(r => r.id === id);
    if (fallbackRadio) {
      return fallbackRadio;
    }
    return null;
  }
};
