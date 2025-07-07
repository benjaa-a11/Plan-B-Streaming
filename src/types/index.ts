export type Channel = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string[];
  category: string;
  description?: string;
};

export type ChannelOption = {
  id: string;
  name: string;
  logoUrl?: string;
};

export type Match = {
  id: string;
  team1: string;
  team1Logo?: string;
  team2: string;
  team2Logo?: string;
  time: string;
  isLive: boolean;
  isWatchable: boolean;
  channels: ChannelOption[];
  dates?: string;
  matchTimestamp: Date;
  tournamentName?: string;
  tournamentLogo?: string | { light: string; dark: string };
};

export type AdminAgendaMatch = {
  id: string;
  team1: string;
  team2: string;
  tournamentId: string;
  channels: string[];
  dates?: string;
  time: Date;
  // Enriched data for display
  team1Name?: string;
  team2Name?: string;
  tournamentName?: string;
}

export type Movie = {
  id: string;
  imdbID?: string;
  tmdbID?: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  streamUrl: string;
  trailerUrl?: string;
  category: string[];
  synopsis: string;
  year?: number;
  duration: string;
  format?: 'mp4' | 'iframe';
  director?: string;
  actors?: string;
  rating?: string;
};

export type Radio = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string[];
  emisora?: string;
};

export type Tournament = {
  id: string; // The firestore document ID
  tournamentId: string; // The user-facing ID, stored in the `id` field of the doc
  name: string;
  logoUrl: string[]; // [dark_theme_logo, light_theme_logo]
};

export type Team = {
  id: string; // The firestore document ID
  path: string; // The full path to the document for collectionGroup operations
  name: string;
  logoUrl: string;
  country: string;
};
