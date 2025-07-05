import type { Channel, Match, Movie } from "@/types";

// Helper to create timestamps for today for placeholder data
const createTimestamp = (hour: number, minute: number = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};
// Placeholder data for matches, fully processed as if it came from the new `getAgendaMatches` function.
export const placeholderMatches: Match[] = [
  {
    id: 'match-1',
    team1: 'Argentina',
    team1Logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Selecci%C3%B3n_de_f%C3%BAtbol_de_Argentina_crest.svg/1200px-Selecci%C3%B3n_de_f%C3%BAtbol_de_Argentina_crest.svg.png',
    team2: 'Canadá',
    team2Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Canada_Soccer_logo.svg/1200px-Canada_Soccer_logo.svg.png',
    time: '13:00',
    isLive: new Date().getHours() >= 21,
    isWatchable: true,
    channels: [{ id: 'deportes-1', name: 'DSports', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/DSports.png' }],
    dates: 'Fase de Grupos · Jornada 1',
    matchTimestamp: createTimestamp(21, 0),
    tournamentName: 'Copa América 2024',
    tournamentLogo: {
      dark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Copa_Am%C3%A9rica_2024_logo.svg/1200px-Copa_Am%C3%A9rica_2024_logo.svg.png',
      light: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Copa_Am%C3%A9rica_2024_logo.svg/1200px-Copa_Am%C3%A9rica_2024_logo.svg.png',
    },
  },
];



export const placeholderMovies: Movie[] = [
  {
    id: "peli-1",
    tmdbID: "157336",
    title: "Interestelar",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg",
    streamUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    category: ["Aventura", "Drama", "Ciencia Ficción"],
    synopsis: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de asegurar la supervivencia de la humanidad.",
    year: 2014,
    duration: "2h 49m",
    format: "mp4",
    director: "Christopher Nolan",
    actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    rating: "8.7",
  },
  {
    id: "peli-2",
    tmdbID: "27205",
    title: "El Origen",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg",
    streamUrl: "https://www.youtube.com/embed/YoHD9XEInc0", // Trailer
    category: ["Acción", "Aventura", "Ciencia Ficción"],
    synopsis: "A un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños se le da la tarea inversa de plantar una idea en la mente de un C.E.O.",
    year: 2010,
    duration: "2h 28m",
    format: "iframe",
    director: "Christopher Nolan",
    actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
    rating: "8.8",
  },
  {
    id: "peli-3",
    tmdbID: "155",
    title: "El Caballero de la Noche",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    streamUrl: "https://www.youtube.com/embed/EXeTwQWrcwY", // Trailer
    category: ["Acción", "Crimen", "Drama"],
    synopsis: "Cuando la amenaza conocida como el Joker causa estragos y caos en la gente de Gotham, Batman debe aceptar una de las mayores pruebas psicológicas y físicas de su capacidad para luchar contra la injusticia.",
    year: 2008,
    duration: "2h 32m",
    format: "iframe",
    director: "Christopher Nolan",
    actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
    rating: "9.0",
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
