"use server";

import { cache } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, Timestamp, orderBy, documentId } from "firebase/firestore";
import type { Channel, Match, ChannelOption } from "@/types";
import { placeholderChannels } from "./placeholder-data";

// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  return placeholderChannels;
};

export const getChannels = cache(async (): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(channelsCollection);
    
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
});

export const getChannelById = cache(async (id: string): Promise<Channel | null> => {
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
});

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

export const getCategories = cache(async (): Promise<string[]> => {
  const channels = await getChannels();
  const categories = new Set(channels.map(channel => channel.category));
  return Array.from(categories).sort();
});

export const getChannelsByCategory = cache(async (category: string, excludeId?: string): Promise<Channel[]> => {
  const allChannels = await getChannels();
  return allChannels.filter(channel => {
    const isSameCategory = channel.category === category;
    const isNotExcluded = excludeId ? channel.id !== excludeId : true;
    return isSameCategory && isNotExcluded;
  }).slice(0, 5); // Return a max of 5 related channels
});

const fetchMatchesForTournament = async (
  collectionName: string,
  tournamentName: string,
  tournamentLogo: string | { light: string; dark: string },
  channelsMap: Map<string, Channel>
): Promise<Match[]> => {
  const now = new Date();
  const todayARTStr = now.toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });

  const startOfDay = new Date(`${todayARTStr}T00:00:00.000-03:00`);
  const endOfDay = new Date(`${todayARTStr}T23:59:59.999-03:00`);

  const processMatches = (matchDocs: any[]): Match[] => {
    const matchExpiration = new Date(now.getTime() - (3 * 60 * 60 * 1000));

    return matchDocs
      .map(matchData => {
        const matchTimestamp = matchData.matchTimestamp?.toDate
          ? matchData.matchTimestamp.toDate()
          : new Date(matchData.matchTimestamp);
        
        const isToday = matchTimestamp >= startOfDay && matchTimestamp <= endOfDay;
        if (!isToday) return null;

        const isExpired = matchTimestamp < matchExpiration;
        if (isExpired) return null;
        
        const channelIds: string[] = Array.isArray(matchData.channels) ? matchData.channels : [];
        const channelOptions: ChannelOption[] = channelIds
          .map(id => {
            const channel = channelsMap.get(id);
            if (!channel) return null;
            return { id: channel.id, name: channel.name, logoUrl: channel.logoUrl };
          })
          .filter((c): c is ChannelOption => c !== null);

        return {
          id: matchData.id,
          team1: matchData.team1,
          team1Logo: matchData.team1Logo,
          team2: matchData.team2,
          team2Logo: matchData.team2Logo,
          time: matchTimestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires', hour12: false }),
          isLive: now >= matchTimestamp,
          channels: channelOptions,
          matchDetails: matchData.matchDetails,
          matchTimestamp: matchTimestamp,
          tournamentName,
          tournamentLogo
        } as Match;
      })
      .filter((match): match is Match => match !== null)
      .sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());
  };
  
  try {
    const q = query(
      collection(db, collectionName),
      where("matchTimestamp", ">=", startOfDay),
      where("matchTimestamp", "<=", endOfDay),
      orderBy("matchTimestamp")
    );
    const matchSnapshot = await getDocs(q);

    const sourceData = matchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (sourceData.length === 0) {
      console.log(`No hay partidos para hoy en la colección '${collectionName}'.`);
    }

    return processMatches(sourceData);
    
  } catch (error) {
    console.error(`Error al obtener partidos de ${collectionName}:`, error);
    return [];
  }
};


export const getHeroMatches = cache(async (): Promise<Match[]> => {
  const allChannels = await getChannels();
  const channelsMap = new Map(allChannels.map(c => [c.id, c]));

  const mdcMatches = fetchMatchesForTournament(
    'mdc25',
    'Mundial de Clubes FIFA 2025™',
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgncCRI6MuG41vT_fctpMHh4__yYc2efUPB7jpjV9Ro8unR17c9EMBQcaIYmjPShAnnLG1Q1m-9KbNmZoK2SJnWV9bwJ1FN4OMzgcBcy7inf6c9JCSKFz1uV31aC6B1u4EeGxDwQE4z24d7sVZOJzpFjBAG0KECpsJltnqNyH9_iaTnGukhT4gWGeGj_FQ/s16000/Copa%20Mundial%20de%20Clubes.png',
    channelsMap
  );
  
  const copaArgentinaMatches = fetchMatchesForTournament(
    'copaargentina',
    'Copa Argentina',
    {
      light: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhMVspg_c6CLXysEZ8f-24rMQ8tfbZtn1WO8KDjZNpFXHmEWco46YoFncJZ1HEdT-nQ0azG-0sUUFiNVWe2eNPSSWI9Xk7aQXun4hrTfr-Ik-XE_SrTX0KzbYojh5kafAWACfwjlujielSrSU4E3bxq6RU8uwoBW4N5-3LCqYkbPa6xvENXZ2O3prv0DHA/s512/Copa%20Argentina%20AXION%20energy.png',
      dark: 'https://blogger.googleusercontent.com/img/a/AVvXsEi9UORURfsnLGoEWprgs4a69QnccK54jCUVTi-9jJ8aZrWgAakBfIV6957zDUxQ8HDFJKvusZ9av0KuIdJa9y4vx9Ut-QTlsHd755hTVSFBxa_d1DkIwCDDxxZxzmhIRXNONSWKwVc9DzIh6fjrhGLRodCYLBaw99cZTX90tPzSIcmgEY3g7Ma2kUFO=s512',
    },
    channelsMap
  );
  
  const [mdcResult, copaResult] = await Promise.all([mdcMatches, copaArgentinaMatches]);
  
  const allMatches = [...mdcResult, ...copaResult];
  allMatches.sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());

  return allMatches;
});
