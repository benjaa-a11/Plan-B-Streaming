import type { Channel, Match } from "@/types";

// Helper to create timestamps for today for placeholder data
const createTimestamp = (hour: number, minute: number = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Placeholder data uses a structure similar to what Firestore would return.
// The `getTodaysMatches` function will process this into the `Match` type.
export const placeholderMatches: any[] = [
  {
    id: "mdc-1",
    team1: "River Plate",
    team1Logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Escudo_del_C._A._River_Plate.svg/240px-Escudo_del_C._A._River_Plate.svg.png",
    team2: "Man City",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/240px-Manchester_City_FC_badge.svg.png",
    matchTimestamp: createTimestamp(16, 0), // Match at 4:00 PM today
    channels: ["deportes-1", "deportes-2"],
    matchDetails: "Fase de grupos · Grupo C · Jornada 1 de 3",
  },
  {
    id: "mdc-2",
    team1: "Boca Juniors",
    team1Logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Boca_Juniors_logo18.svg/240px-Boca_Juniors_logo18.svg.png",
    team2: "Real Madrid",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/240px-Real_Madrid_CF.svg.png",
    matchTimestamp: createTimestamp(20, 0), // Match at 8:00 PM today
    channels: ["deportes-2"],
    matchDetails: "Fase de grupos · Grupo A · Jornada 1 de 3",
  },
  {
    id: "mdc-3",
    team1: "Palmeiras",
    team1Logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/240px-Palmeiras_logo.svg.png",
    team2: "Chelsea",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/240px-Chelsea_FC.svg.png",
    matchTimestamp: new Date(new Date().setDate(new Date().getDate() + 1)), // A future match to ensure it's filtered out
    channels: ["deportes-1"],
  },
  {
    id: "mdc-4",
    team1: "Flamengo",
    team1Logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_logo.svg",
    team2: "FC Bayern",
    team2Logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/240px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    // Match that started 2 hours ago, should still be visible.
    matchTimestamp: createTimestamp(new Date().getHours() - 2),
    channels: ["deportes-1"],
    matchDetails: "Octavos de Final · Partido de Ida",
  },
   {
    id: "mdc-5",
    team1: "Inter Milan",
    team1Logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/240px-FC_Internazionale_Milano_2021.svg.png",
    team2: "Al-Ahly",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Al_Ahly_SC_logo.svg/240px-Al_Ahly_SC_logo.svg.png",
    // Match that started 4 hours ago, should be hidden.
    matchTimestamp: createTimestamp(new Date().getHours() - 4),
    channels: ["deportes-2"],
  },
];


export const placeholderChannels: Channel[] = [
  {
    id: "deportes-1",
    name: "DSports",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5a/DSports.png",
    streamUrl: ["https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"],
    category: "Deportes",
    description: "La mejor cobertura deportiva, 24 horas al día.",
  },
  {
    id: "noticias-1",
    name: "France 24",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/France_24_Espa%C3%B1ol_logo.svg/512px-France_24_Espa%C3%B1ol_logo.svg.png",
    streamUrl: ["https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1"],
    category: "Noticias",
    description: "Mantente informado con noticias de todo el mundo.",
  },
  {
    id: "infantil-1",
    name: "Pluto TV Kids",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pluto_TV_Kids_logo.svg/512px-Pluto_TV_Kids_logo.svg.png",
    streamUrl: ["https://www.youtube.com/embed/XqZsoesa55w?autoplay=1"],
    category: "Infantil",
    description: "Contenido divertido y educativo para los más pequeños.",
  },
  {
    id: "peliculas-1",
    name: "TNT",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/TNT_2016.svg/512px-TNT_2016.svg.png",
    streamUrl: [],
    category: "Películas",
    description: "Grandes éxitos de taquilla y clásicos del cine.",
  },
  {
    id: "musica-1",
    name: "MTV",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/MTV_logo.svg/512px-MTV_logo.svg.png",
    streamUrl: ["https://www.youtube.com/embed/DWcJFNfaw9c?autoplay=1"],
    category: "Música",
    description: "Los mejores videos musicales del momento.",
  },
  {
    id: "documentales-1",
    name: "National Geographic",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Geographic_logo.svg/512px-National_Geographic_logo.svg.png",
    streamUrl: ["https://www.youtube.com/embed/I-OVzYchqjI?autoplay=1"],
    category: "Documentales",
    description: "Explora las maravillas de nuestro mundo.",
  },
  {
    id: "deportes-2",
    name: "Fox Sports",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Fox_Sports_logo_2020.svg/512px-Fox_Sports_logo_2020.svg.png",
    streamUrl: ["https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"],
    category: "Deportes",
    description: "Partidos en vivo, análisis y resúmenes.",
  },
  {
    id: "noticias-2",
    name: "Bloomberg",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bloomberg_Television_logo.svg/512px-Bloomberg_Television_logo.svg.png",
    streamUrl: ["https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1"],
    category: "Noticias",
    description: "Análisis económico y noticias financieras.",
  },
];
