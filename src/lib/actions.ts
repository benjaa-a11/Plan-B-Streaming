"use server";

import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId, Timestamp } from "firebase/firestore";
import type { Channel, Match, ChannelOption, Movie } from "@/types";
import { placeholderChannels, placeholderMovies } from "./placeholder-data";

// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  return placeholderChannels;
};

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
    // Firestore 'in' query is limited to 30 elements in Next.js 14, so we chunk the IDs.
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
    const allPlaceholderChannels = placeholderChannels;
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
  }).slice(0, 5); // Return a max of 5 related channels
};

export const getAgendaMatches = async (): Promise<Match[]> => {
  try {
    const allChannels = await getChannels();
    const allChannelsMap = new Map(allChannels.map(c => [c.id, { id: c.id, name: c.name, logoUrl: c.logoUrl }]));
    
    const now = new Date();
    // Use Argentina's time zone to determine what "today" is
    const argentinaTimeNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const startOfToday = new Date(argentinaTimeNow.getFullYear(), argentinaTimeNow.getMonth(), argentinaTimeNow.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const matchCollections = ["mdc25", "copaargentina"];
    let allMatches: Match[] = [];

    for (const coll of matchCollections) {
      const q = query(
          collection(db, coll),
          where("matchTimestamp", ">=", Timestamp.fromDate(startOfToday)),
          where("matchTimestamp", "<", Timestamp.fromDate(endOfToday))
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          const matchTimestamp = (data.matchTimestamp as Timestamp).toDate();
          
          const timeSinceStart = now.getTime() - matchTimestamp.getTime();
          // Hide match 2 hours and 15 minutes after it started (135 minutes)
          if (timeSinceStart > (135 * 60 * 1000)) {
              return;
          }

          const channelOptions: ChannelOption[] = (data.channels || []).map((id: string) => 
              allChannelsMap.get(id)
          ).filter((c: ChannelOption | undefined): c is ChannelOption => !!c);
          
          const isLive = now.getTime() >= matchTimestamp.getTime();
          // Button is enabled 30 mins before match
          const isWatchable = matchTimestamp.getTime() - now.getTime() <= (30 * 60 * 1000);

          allMatches.push({
              id: docSnap.id,
              team1: data.team1,
              team1Logo: data.team1Logo,
              team2: data.team2,
              team2Logo: data.team2Logo,
              time: matchTimestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires', hour12: false }),
              isLive: isLive,
              isWatchable: isWatchable,
              channels: channelOptions,
              matchDetails: data.matchDetails,
              matchTimestamp: matchTimestamp,
              tournamentName: coll === 'mdc25' ? 'Copa del Mundo 2025' : 'Copa Argentina',
              tournamentLogo: coll === 'mdc25' ? { light: '/mdc25-light.png', dark: '/mdc25-dark.png' } : { light: '/afa-light.png', dark: '/afa-dark.png' },
          });
      });
    }
    
    // Sort all combined matches by time
    return allMatches.sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());

  } catch (error) {
    console.error("Error al obtener partidos de Firebase:", error);
    // Return empty array on error as there is no placeholder match data
    return [];
  }
};


// --- MOVIES ---

const useMovieFallbackData = () => {
  console.warn("Firebase no disponible o colección de películas vacía. Usando datos de demostración.");
  return placeholderMovies;
};

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const moviesCollection = collection(db, "peliculas");
    const movieSnapshot = await getDocs(query(moviesCollection));
    
    if (movieSnapshot.empty) {
      return useMovieFallbackData();
    }
    
    const movies = movieSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movie));
    
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
      return { id: movieSnapshot.id, ...movieSnapshot.data() } as Movie;
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

export const getMovieCategories = async (): Promise<string[]> => {
  const movies = await getMovies();
  if (!movies || movies.length === 0) return [];
  const categories = new Set(movies.map(movie => movie.category));
  return Array.from(categories).sort();
};
