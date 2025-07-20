
"use server";

import { cache } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId, Timestamp, collectionGroup } from "firebase/firestore";
import type { Channel, Match, ChannelOption, Movie, Radio, Tournament, Team, AppStatus } from "@/types";
import { placeholderChannels, placeholderMovies, placeholderRadios, placeholderTournaments, placeholderTeams } from "./placeholder-data";

// Helper function to resolve .pls file to an actual stream URL
const _resolvePlsUrl = async (url: string): Promise<string | null> => {
    if (!url || !url.endsWith('.pls')) {
        return url; // Return non-pls URLs or empty/null URLs directly
    }

    // If it is a .pls url, it must be resolved. If it can't, it's invalid.
    console.log(`Resolving .pls URL: ${url}`);
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout for a faster response

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Failed to fetch .pls file [${response.status}]: ${url}`);
            return null; // Return null on failure to fetch
        }

        const text = await response.text();
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.trim().toLowerCase().startsWith('file1=')) {
                const streamUrl = line.substring(line.indexOf('=') + 1).trim();
                console.log(`Resolved .pls url ${url} to ${streamUrl}`);
                return streamUrl; // Return the resolved URL
            }
        }

        console.warn(`.pls file did not contain a 'File1=' entry: ${url}`);
        return null; // Return null if parsing fails
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Timeout fetching .pls url: ${url}`);
        } else {
            console.error(`Error resolving .pls url ${url}:`, error);
        }
        return null; // Return null on any other error
    }
};


// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  // Filter hidden channels from the fallback data
  return placeholderChannels.filter(c => !c.isHidden);
};

// Uncached version of getChannels to ensure data is always fresh for the public app
export const getChannels = async (includePlaceholders = false): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(query(channelsCollection));
    
    if (channelSnapshot.empty && includePlaceholders) {
      return useFallbackData();
    }
    
    const allChannels = channelSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Channel));
    
    // Server-side filter to ensure channels are visible unless explicitly hidden.
    // This shows channels where `isHidden` is `false` or the field does not exist.
    const visibleChannels = allChannels.filter(channel => channel.isHidden !== true);
    
    return visibleChannels;
  } catch (error) {
    console.error("Error al obtener canales de Firebase:", error);
    if (includePlaceholders) return useFallbackData();
    return [];
  }
};

// This version is for the admin panel and fetches ALL channels, including hidden ones.
export const getAllChannelsForAdmin = async (includePlaceholders = false): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(query(channelsCollection));
    
    if (channelSnapshot.empty && includePlaceholders) {
      return placeholderChannels; // Return all, including hidden
    }
    
    return channelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel));
  } catch (error) {
    console.error("Error fetching all channels for admin:", error);
    if (includePlaceholders) return placeholderChannels;
    return [];
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
      const fallbackChannel = (await getAllChannelsForAdmin(true)).find(c => c.id === id);
      if (fallbackChannel) {
        console.warn(`Canal con id ${id} no encontrado en Firebase. Usando dato de demostración.`);
        return fallbackChannel;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener canal con id ${id}:`, error);
     const fallbackChannel = (await getAllChannelsForAdmin(true)).find(c => c.id === id);
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
    const allPlaceholderChannels = await getAllChannelsForAdmin(true);
    const placeholderMap = new Map(allPlaceholderChannels.map(c => [c.id, c]));
    return ids.map(id => placeholderMap.get(id)).filter((c): c is Channel => !!c);
  }
};

export const getCategories = async (): Promise<string[]> => {
  const channels = await getChannels(true);
  const categories = new Set(channels.map(channel => channel.category));
  return Array.from(categories).sort();
};

export const getChannelsByCategory = async (category: string, excludeId?: string): Promise<Channel[]> => {
  const allChannels = await getChannels(true); // Gets only visible channels
  return allChannels.filter(channel => {
    const isSameCategory = channel.category === category;
    const isNotExcluded = excludeId ? channel.id !== excludeId : true;
    return isSameCategory && isNotExcluded;
  }).slice(0, 4); // Return a max of 4 related channels
};

export const getAgendaMatches = cache(async (): Promise<Match[]> => {
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
        return [];
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
    return [];
  }
});


// --- MOVIES ---

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_LOGO_BASE_URL = "https://image.tmdb.org/t/p/w500";


const _fetchTMDbData = cache(async (tmdbID: string) => {
  // The key is checked before this function is called, so we can assume it exists.
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=images`);
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
  // The key is checked before this function is called.
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
  // The key is checked before this function is called.
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


const _enrichMovieData = async (
    docId: string, 
    firestoreMovie: any,
    tmdbLists?: { trendingIds: Set<string>; topRatedIds: Set<string> }
): Promise<Movie | null> => {
  const [tmdbMovieData, tmdbCreditsData, tmdbVideoUrl] = firestoreMovie.tmdbID
    ? await Promise.all([
        _fetchTMDbData(firestoreMovie.tmdbID),
        _fetchTMDbCredits(firestoreMovie.tmdbID),
        _fetchTMDbVideos(firestoreMovie.tmdbID),
      ])
    : [null, null, null];
  
  const title = firestoreMovie.title || tmdbMovieData?.title;
  if (!title) {
    console.warn(`Skipping movie with docId ${docId} because a title could not be determined.`);
    return null;
  }

  let posterUrl = '';
  if (firestoreMovie.posterUrl && firestoreMovie.posterUrl.trim().length > 0) {
      posterUrl = firestoreMovie.posterUrl;
  } 
  else if (tmdbMovieData && tmdbMovieData.poster_path) {
      posterUrl = `${TMDB_IMAGE_BASE_URL}${tmdbMovieData.poster_path}`;
  }

  if (!posterUrl) {
      posterUrl = 'https://placehold.co/500x750.png';
  }

  const backdropUrl = firestoreMovie.heroImageUrl || (tmdbMovieData?.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${tmdbMovieData.backdrop_path}` : undefined);
  
  // Find the best logo
  const logos = tmdbMovieData?.images?.logos || [];
  const spanishLogo = logos.find((logo: any) => logo.iso_639_1 === 'es');
  const englishLogo = logos.find((logo: any) => logo.iso_639_1 === 'en');
  const anyLogo = logos[0];
  const bestLogo = spanishLogo || englishLogo || anyLogo;
  const logoUrl = bestLogo ? `${TMDB_LOGO_BASE_URL}${bestLogo.file_path}` : undefined;

  const synopsis = firestoreMovie.synopsis || tmdbMovieData?.overview || '';
  const year = firestoreMovie.year || (tmdbMovieData?.release_date ? parseInt(tmdbMovieData.release_date.split('-')[0], 10) : undefined);
  const category = firestoreMovie.category || tmdbMovieData?.genres?.map((g: any) => g.name) || [];
  
  let duration = firestoreMovie.duration;
  if (!duration && tmdbMovieData?.runtime) {
    const hours = Math.floor(tmdbMovieData.runtime / 60);
    const minutes = tmdbMovieData.runtime % 60;
    duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  const director = firestoreMovie.director || tmdbCreditsData?.crew?.find((p: any) => p.job === 'Director')?.name;
  const actors = firestoreMovie.actors || tmdbCreditsData?.cast?.slice(0, 3).map((p: any) => p.name).join(', ');
  const rating = firestoreMovie.rating || (tmdbMovieData?.vote_average ? tmdbMovieData.vote_average.toFixed(1) : undefined);
  
  return {
    id: docId,
    tmdbID: firestoreMovie.tmdbID,
    streamUrl: firestoreMovie.streamUrl,
    format: firestoreMovie.format,
    trailerUrl: tmdbVideoUrl,
    title,
    posterUrl,
    backdropUrl,
    logoUrl,
    synopsis,
    year,
    category,
    duration: duration || "N/A",
    director,
    actors,
    rating,
    isTrending: tmdbLists?.trendingIds.has(String(firestoreMovie.tmdbID)),
    isTopRated: tmdbLists?.topRatedIds.has(String(firestoreMovie.tmdbID)),
    popularity: tmdbMovieData?.popularity,
    isHero: firestoreMovie.isHero,
    heroImageUrl: firestoreMovie.heroImageUrl,
  };
};

const useMovieFallbackData = (includePlaceholders: boolean) => {
  if (includePlaceholders) {
    console.warn("API de TMDb no configurada o colección de películas vacía. Usando datos de demostración.");
    return placeholderMovies;
  }
  return [];
};

const _fetchTMDbList = cache(async (endpoint: string): Promise<Set<string>> => {
    if (!TMDB_API_KEY) return new Set();
    try {
        const res = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=es-ES&page=1`);
        if (!res.ok) return new Set();
        const data = await res.json();
        return new Set(data.results.map((m: any) => String(m.id)));
    } catch (error) {
        console.error(`Error fetching TMDb list ${endpoint}:`, error);
        return new Set();
    }
});


// Uncached version of getMovies to ensure data is always fresh
export const getMovies = async (includePlaceholders = false): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    console.error("CRITICAL: La variable de entorno TMDB_API_KEY no está configurada. La sección de películas no funcionará.");
    return useMovieFallbackData(includePlaceholders);
  }

  try {
    const moviesCollection = collection(db, "peliculas");
    const movieSnapshot = await getDocs(query(moviesCollection));
    
    if (movieSnapshot.empty && includePlaceholders) {
      return useMovieFallbackData(true);
    }
    
    const [trendingIds, topRatedIds] = await Promise.all([
      _fetchTMDbList('/movie/trending/week'),
      _fetchTMDbList('/movie/top_rated'),
    ]);

    const moviePromises = movieSnapshot.docs.map(doc => 
      _enrichMovieData(doc.id, doc.data(), { trendingIds, topRatedIds })
    );
    const enrichedMovies = await Promise.all(moviePromises);

    return enrichedMovies.filter((movie): movie is Movie => movie !== null);

  } catch (error) {
    console.error("Error al obtener películas de Firebase:", error);
    return useMovieFallbackData(includePlaceholders);
  }
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  if (!TMDB_API_KEY) {
    console.error("CRITICAL: La variable de entorno TMDB_API_KEY no está configurada.");
    const fallbackMovie = (await getMovies(true)).find(m => m.id === id);
    return fallbackMovie || null;
  }
  try {
    const movieDoc = doc(db, "peliculas", id);
    const movieSnapshot = await getDoc(movieDoc);

    if (movieSnapshot.exists()) {
      return await _enrichMovieData(movieSnapshot.id, movieSnapshot.data());
    } else {
      const fallbackMovie = (await getMovies(true)).find(m => m.id === id);
      if (fallbackMovie) {
        console.warn(`Película con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
        return fallbackMovie;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener película con id ${id}:`, error);
    const fallbackMovie = (await getMovies(true)).find(m => m.id === id);
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
  if (!TMDB_API_KEY) {
    console.error("CRITICAL: La variable de entorno TMDB_API_KEY no está configurada.");
    const allPlaceholderMovies = await getMovies(true);
    const placeholderMap = new Map(allPlaceholderMovies.map(m => [m.id, m]));
    return ids.map(id => placeholderMap.get(id)).filter((m): m is Movie => !!m);
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
        const allPlaceholderMovies = await getMovies(true);
        const placeholderMap = new Map(allPlaceholderMovies.map(m => [m.id, m]));
        return ids.map(id => placeholderMap.get(id)).filter((m): m is Movie => !!m);
    }

    const enrichedMoviesPromises = firestoreMoviesData.map(movie => _enrichMovieData(movie.id, movie.data));
    const enrichedMovies = (await Promise.all(enrichedMoviesPromises)).filter((m): m is Movie => !!m);

    // Preserve original order
    const movieMap = new Map(enrichedMovies.map(m => [m.id, m]));
    return ids.map(id => movieMap.get(id)).filter((m): m is Movie => !!m);

  } catch (error) {
    console.error("Error fetching movies by IDs from Firebase:", error);
    // Fallback to placeholder data for any matching IDs
    const allPlaceholderMovies = await getMovies(true);
    const placeholderMap = new Map(allPlaceholderMovies.map(m => [m.id, m]));
    return ids.map(id => placeholderMap.get(id)).filter((m): m is Movie => !!m);
  }
};

export const getMovieCategories = async (): Promise<string[]> => {
  const movies = await getMovies(true);
  if (!movies || movies.length === 0) return [];
  const categories = new Set(movies.flatMap(movie => movie.category || []));
  return Array.from(categories).sort();
};

export const getSimilarMovies = async (currentMovieId: string, categories: string[] = [], limit: number = 10): Promise<Movie[]> => {
  if (!categories || categories.length === 0) {
    return [];
  }
  
  try {
    const allMovies = await getMovies(true);
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

const useRadioFallbackData = (includePlaceholders: boolean) => {
  if (includePlaceholders) {
    console.warn("Firebase no disponible o colección de radios vacía. Usando datos de demostración.");
    return placeholderRadios;
  }
  return [];
};

export const getRadios = async (includePlaceholders = false): Promise<Radio[]> => {
  try {
    const radiosCollection = collection(db, "radio");
    const radioSnapshot = await getDocs(query(radiosCollection));
    
    if (radioSnapshot.empty && includePlaceholders) {
      return useRadioFallbackData(true);
    }
    
    // Concurrently resolve all stream URLs and filter out invalid ones
    const radios = await Promise.all(radioSnapshot.docs.map(async (doc) => {
      const radioData = { id: doc.id, ...doc.data() } as Radio;
      if (radioData.streamUrl && Array.isArray(radioData.streamUrl)) {
        const resolvedUrls = await Promise.all(radioData.streamUrl.map(url => _resolvePlsUrl(url)));
        radioData.streamUrl = resolvedUrls.filter((url): url is string => !!url);
      }
      return radioData;
    }));
    
    return radios;
  } catch (error) {
    console.error("Error al obtener radios de Firebase:", error);
    return useRadioFallbackData(includePlaceholders);
  }
};

const processRadioData = async (data: any): Promise<Radio> => {
    const radioData = { ...data }; // Create a mutable copy
    if (radioData.streamUrl && Array.isArray(radioData.streamUrl)) {
      const resolvedUrls = await Promise.all(
        radioData.streamUrl.map(url => _resolvePlsUrl(url))
      );
      radioData.streamUrl = resolvedUrls.filter((url): url is string => !!url);
    }
    return radioData;
};

export const getRadioById = async (id: string): Promise<Radio | null> => {
  try {
    const radioDocRef = doc(db, "radio", id);
    const radioSnapshot = await getDoc(radioDocRef);

    if (radioSnapshot.exists()) {
      return await processRadioData({ id: radioSnapshot.id, ...radioSnapshot.data() });
    }
    
    const fallbackRadio = (await getRadios(true)).find(r => r.id === id);
    if (fallbackRadio) {
      console.warn(`Radio con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
      return await processRadioData(fallbackRadio);
    }

    return null;
  } catch (error) {
    console.error(`Error al obtener radio con id ${id}:`, error);
    const fallbackRadio = (await getRadios(true)).find(r => r.id === id);
    if (fallbackRadio) {
      return await processRadioData(fallbackRadio);
    }
    return null;
  }
};


// --- TOURNAMENTS ---

const useTournamentFallbackData = (includePlaceholders: boolean) => {
    if (includePlaceholders) {
      console.warn("Firebase no disponible o colección de torneos vacía. Usando datos de demostración.");
      return placeholderTournaments;
    }
    return [];
};

export const getTournaments = async (includePlaceholders = false): Promise<Tournament[]> => {
    try {
        const tournamentsCollection = collection(db, "tournaments");
        const tournamentSnapshot = await getDocs(query(tournamentsCollection));
        
        if (tournamentSnapshot.empty && includePlaceholders) {
            return useTournamentFallbackData(true);
        }
        
        const tournaments = tournamentSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              tournamentId: data.id,
              name: data.name,
              logoUrl: data.logoUrl || [],
            } as Tournament;
        });
        
        return tournaments;
    } catch (error) {
        console.error("Error al obtener torneos de Firebase:", error);
        return useTournamentFallbackData(includePlaceholders);
    }
};

// --- TEAMS ---

const useTeamFallbackData = (includePlaceholders: boolean) => {
    if (includePlaceholders) {
      console.warn("Firebase no disponible o colección de equipos vacía. Usando datos de demostración.");
      return placeholderTeams;
    }
    return [];
};

export const getTeams = async (includePlaceholders = false): Promise<Team[]> => {
    try {
        const teamsQuery = query(collectionGroup(db, 'clubs'));
        const teamSnapshot = await getDocs(teamsQuery);

        if (teamSnapshot.empty && includePlaceholders) {
            return useTeamFallbackData(true);
        }
        
        const teams = teamSnapshot.docs.map(doc => ({
          id: doc.id,
          path: doc.ref.path,
          ...doc.data()
        } as Team));
        
        return teams;
    } catch (error) {
        console.error("Error al obtener equipos de Firebase:", error);
        return useTeamFallbackData(includePlaceholders);
    }
};


// --- APP STATUS ---
export const getAppStatus = cache(async (): Promise<AppStatus | null> => {
  try {
      const statusDoc = await getDoc(doc(db, "config", "app-status"));
      if (statusDoc.exists()) {
          return statusDoc.data() as AppStatus;
      }
      return null;
  } catch (error) {
      console.error("Error fetching app status:", error);
      // Return a default "all enabled" status if there's an error
      // This prevents the app from being locked out if the config doc is missing or there's a read error.
      return {
          isMaintenanceMode: false,
          maintenanceMessage: '',
          disabledSections: []
      };
  }
});
