import type { Channel, Movie } from "@/types";

// Helper to create timestamps for today for placeholder data
const createTimestamp = (hour: number, minute: number = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Placeholder data uses a structure similar to what Firestore would return.
// The data fetching functions will process this into the `Match` type.
export const placeholderMdcMatches: any[] = [];

export const placeholderCopaArgentinaMatches: any[] = [];

export const placeholderMovies: Movie[] = [
  {
    id: "peli-1",
    title: "Interestelar",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg",
    streamUrl: "https://www.youtube.com/embed/zSWdZVtXT7E", // Trailer
    category: "Ciencia Ficción",
    description: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de asegurar la supervivencia de la humanidad.",
    year: 2014,
    duration: "2h 49m",
  },
  {
    id: "peli-2",
    title: "El Origen",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg",
    streamUrl: "https://www.youtube.com/embed/YoHD9XEInc0", // Trailer
    category: "Acción",
    description: "A un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños se le da la tarea inversa de plantar una idea en la mente de un C.E.O.",
    year: 2010,
    duration: "2h 28m",
  },
  {
    id: "peli-3",
    title: "El Caballero de la Noche",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    streamUrl: "https://www.youtube.com/embed/EXeTwQWrcwY", // Trailer
    category: "Acción",
    description: "Cuando la amenaza conocida como el Joker causa estragos y caos en la gente de Gotham, Batman debe aceptar una de las mayores pruebas psicológicas y físicas de su capacidad para luchar contra la injusticia.",
    year: 2008,
    duration: "2h 32m",
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
