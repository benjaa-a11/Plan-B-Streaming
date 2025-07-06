import type { Channel, Match, Movie, Radio } from "@/types";

// Helper to create timestamps for today for placeholder data
const createTimestamp = (hour: number, minute: number = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Placeholder data is now empty. The application will show a professional
// empty state if the database has no content.
export const placeholderMatches: Match[] = [];
export const placeholderMovies: Movie[] = [];
export const placeholderRadios: Radio[] = [];
export const placeholderChannels: Channel[] = [];
