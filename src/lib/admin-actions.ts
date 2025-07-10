
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, getDocs, Timestamp, deleteField, orderBy } from 'firebase/firestore';
import { z } from 'zod';
import type { AdminAgendaMatch } from '@/types';

// Common state type for forms
export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success: boolean;
};

// Helper to create URL-friendly slugs, now handles accents and special characters
const slugify = (text: string) => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// --- CHANNELS ---

const ChannelSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL de logo válida.' }),
  category: z.string().min(1, { message: 'La categoría es requerida.' }),
  description: z.string().optional(),
  streamUrl: z.array(z.string().url({ message: 'Cada URL de stream debe ser válida.' })).min(1, { message: 'Se requiere al menos una URL de stream.' }),
  isHidden: z.boolean().optional(),
});

export async function addChannel(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const processedData = {
    ...rawData,
    streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
    isHidden: rawData.isHidden === 'on',
  };

  const validatedFields = ChannelSchema.safeParse(processedData);
  
  if (!validatedFields.success) {
    return {
      message: 'Error de validación. Por favor, corrija los campos.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { name } = validatedFields.data;
  const id = slugify(name);
  const channelRef = doc(db, 'channels', id);

  try {
    const docSnap = await getDoc(channelRef);
    if (docSnap.exists()) {
      return { message: `Un canal con el ID '${id}' ya existe.`, success: false };
    }

    await setDoc(channelRef, validatedFields.data);
    revalidatePath('/admin/channels');
    revalidatePath('/');
    return { message: 'Canal añadido exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding channel:', error);
    return { message: 'Error del servidor al intentar añadir el canal.', success: false };
  }
}

export async function updateChannel(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  if (!id) return { message: 'ID de canal no proporcionado.', success: false };
  
  const rawData = Object.fromEntries(formData.entries());
  const processedData = {
    ...rawData,
    streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
    isHidden: rawData.isHidden === 'on',
  };

  const validatedFields = ChannelSchema.safeParse(processedData);

  if (!validatedFields.success) {
    return {
      message: 'Error de validación. Por favor, corrija los campos.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const channelRef = doc(db, 'channels', id);
    await updateDoc(channelRef, validatedFields.data);
    revalidatePath('/admin/channels');
    revalidatePath(`/canal/${id}`);
    revalidatePath('/');
    return { message: 'Canal actualizado exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error updating channel:', error);
    return { message: 'Error del servidor al intentar actualizar el canal.', success: false };
  }
}

export async function deleteChannel(id: string) {
  if (!id) return { message: 'ID de canal no proporcionado.', success: false };
  
  try {
    await deleteDoc(doc(db, 'channels', id));
    revalidatePath('/admin/channels');
    revalidatePath('/');
    return { message: 'Canal eliminado exitosamente.', success: true };
  } catch (error) {
    console.error('Error deleting channel:', error);
    return { message: 'Error del servidor al intentar eliminar el canal.', success: false };
  }
}


// --- RADIOS ---

const RadioSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL de logo válida.' }),
  emisora: z.string().optional(),
  streamUrl: z.array(z.string().url({ message: 'Cada URL de stream debe ser válida.' })).min(1, { message: 'Se requiere al menos una URL de stream.' }),
});

export async function addRadio(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const processedData = {
    ...rawData,
    streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
  };
  const validatedFields = RadioSchema.safeParse(processedData);
  
  if (!validatedFields.success) {
    return {
      message: 'Error de validación.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { name } = validatedFields.data;
  const id = slugify(name);
  const radioRef = doc(db, 'radio', id);

  try {
    const docSnap = await getDoc(radioRef);
    if (docSnap.exists()) {
      return { message: `Una radio con el ID '${id}' ya existe.`, success: false };
    }

    await setDoc(radioRef, validatedFields.data);
    revalidatePath('/admin/radios');
    revalidatePath('/radio');
    return { message: 'Radio añadida exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding radio:', error);
    return { message: 'Error del servidor al intentar añadir la radio.', success: false };
  }
}

export async function updateRadio(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
   if (!id) return { message: 'ID de radio no proporcionado.', success: false };
   
   const rawData = Object.fromEntries(formData.entries());
   const processedData = {
     ...rawData,
     streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
   };
   const validatedFields = RadioSchema.safeParse(processedData);

   if (!validatedFields.success) {
     return {
       message: 'Error de validación.',
       errors: validatedFields.error.flatten().fieldErrors,
       success: false,
     };
   }

   try {
     const radioRef = doc(db, 'radio', id);
     await updateDoc(radioRef, validatedFields.data);
     revalidatePath('/admin/radios');
     revalidatePath('/radio');
     revalidatePath(`/radio/${id}`);
     return { message: 'Radio actualizada exitosamente.', success: true, errors: {} };
   } catch (error) {
     console.error('Error updating radio:', error);
     return { message: 'Error del servidor al intentar actualizar la radio.', success: false };
   }
}

export async function deleteRadio(id: string) {
  if (!id) return { message: 'ID de radio no proporcionado.', success: false };
  
  try {
    await deleteDoc(doc(db, 'radio', id));
    revalidatePath('/admin/radios');
    revalidatePath('/radio');
    return { message: 'Radio eliminada exitosamente.', success: true };
  } catch (error) {
    console.error('Error deleting radio:', error);
    return { message: 'Error del servidor al intentar eliminar la radio.', success: false };
  }
}

// --- MOVIES ---

const MovieSchema = z.object({
  tmdbID: z.string().min(1, 'El ID de TMDb es requerido.'),
  streamUrl: z.string().url('Debe ser una URL válida.'),
  format: z.enum(['mp4', 'iframe'], { required_error: 'Debe seleccionar un formato.' }),
  title: z.string().optional(),
  posterUrl: z.string().url('URL de póster no válida').optional().or(z.literal('')),
  synopsis: z.string().optional(),
});

export async function addMovie(prevState: FormState, formData: FormData): Promise<FormState> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = MovieSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            message: 'Error de validación.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }
    
    let { tmdbID, streamUrl, format, title, posterUrl, synopsis } = validatedFields.data;
    let finalTitle = title; 

    if (!finalTitle) {
        if (!TMDB_API_KEY) {
            return { message: 'La clave de API de TMDb no está configurada. Se requiere un título.', success: false };
        }
        try {
            const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}?api_key=${TMDB_API_KEY}&language=es-ES`);
            if (!response.ok) throw new Error('Failed to fetch movie title from TMDb');
            const movieData = await response.json();
            finalTitle = movieData.title;
            if (!finalTitle) throw new Error('No se pudo obtener el título de TMDb');
        } catch (error) {
             console.error("Error fetching title from TMDb:", error);
             return { message: 'No se pudo obtener el título de TMDb. Por favor, añádelo manualmente.', success: false };
        }
    }
    
    const id = slugify(finalTitle);
    const movieRef = doc(db, 'peliculas', id);

    try {
        const docSnap = await getDoc(movieRef);
        if (docSnap.exists()) {
          return { message: `Una película con el ID '${id}' (del título '${finalTitle}') ya existe.`, success: false };
        }
        
        const dataToSave: { [key: string]: any } = {
            tmdbID,
            streamUrl,
            format,
        };
        
        if (title) dataToSave.title = title;
        if (posterUrl) dataToSave.posterUrl = posterUrl;
        if (synopsis) dataToSave.synopsis = synopsis;

        await setDoc(movieRef, dataToSave);
        revalidatePath('/admin/movies');
        revalidatePath('/peliculas');
        return { message: 'Película añadida exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error adding movie:', error);
        return { message: 'Error del servidor al intentar añadir la película.', success: false };
    }
}

export async function updateMovie(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!id) return { message: 'ID de película no proporcionado.', success: false };

    const validatedFields = MovieSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Error de validación.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { tmdbID, streamUrl, format, title, posterUrl, synopsis } = validatedFields.data;
    
    const dataToUpdate: { [key: string]: any } = {
        tmdbID,
        streamUrl,
        format,
        title: title || deleteField(),
        posterUrl: posterUrl || deleteField(),
        synopsis: synopsis || deleteField(),
    };

    try {
        const movieRef = doc(db, 'peliculas', id);
        await updateDoc(movieRef, dataToUpdate);
        revalidatePath('/admin/movies');
        revalidatePath('/peliculas');
        revalidatePath(`/pelicula/${id}`);
        return { message: 'Película actualizada exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error updating movie:', error);
        return { message: 'Error del servidor al intentar actualizar la película.', success: false };
    }
}

export async function deleteMovie(id: string) {
    if (!id) return { message: 'ID de película no proporcionado.', success: false };

    try {
        await deleteDoc(doc(db, 'peliculas', id));
        revalidatePath('/admin/movies');
        revalidatePath('/peliculas');
        return { message: 'Película eliminada exitosamente.', success: true };
    } catch (error) {
        console.error('Error deleting movie:', error);
        return { message: 'Error del servidor al intentar eliminar la película.', success: false };
    }
}

// --- TOURNAMENTS ---

const TournamentSchema = z.object({
  tournamentId: z.string().min(3, 'El ID debe tener al menos 3 caracteres.').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones.'),
  name: z.string().min(1, 'El nombre es requerido.'),
  logoUrlDark: z.string().url('URL de logo (tema oscuro) no válida.').optional().or(z.literal('')),
  logoUrlLight: z.string().url('URL de logo (tema claro) no válida.').optional().or(z.literal('')),
});

export async function addTournament(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = TournamentSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
  }

  const { tournamentId, name, logoUrlDark, logoUrlLight } = validatedFields.data;
  const dataToSave = { id: tournamentId, name, logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean) };
  
  const docId = slugify(name);
  const tournamentRef = doc(db, 'tournaments', docId);

  try {
     const docSnap = await getDoc(tournamentRef);
    if (docSnap.exists()) {
      return { message: `Un torneo con el ID '${docId}' ya existe.`, success: false };
    }

    await setDoc(tournamentRef, dataToSave);
    revalidatePath('/admin/tournaments');
    revalidatePath('/');
    return { message: 'Torneo añadido exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding tournament:', error);
    return { message: 'Error del servidor al añadir el torneo.', success: false };
  }
}

export async function updateTournament(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!id) return { message: 'ID de torneo no proporcionado.', success: false };
    
    const validatedFields = TournamentSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    const { tournamentId, name, logoUrlDark, logoUrlLight } = validatedFields.data;
    const dataToSave = { id: tournamentId, name, logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean) };

    try {
        await updateDoc(doc(db, 'tournaments', id), dataToSave);
        revalidatePath('/admin/tournaments');
        revalidatePath('/');
        return { message: 'Torneo actualizado exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error updating tournament:', error);
        return { message: 'Error del servidor al actualizar el torneo.', success: false };
    }
}

export async function deleteTournament(id: string) {
    if (!id) return { message: 'ID de torneo no proporcionado.', success: false };
    try {
        await deleteDoc(doc(db, 'tournaments', id));
        revalidatePath('/admin/tournaments');
        revalidatePath('/');
        return { message: 'Torneo eliminado exitosamente.', success: true };
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return { message: 'Error del servidor al eliminar el torneo.', success: false };
    }
}

// --- TEAMS ---

const TeamSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'URL de logo no válida.' }),
  country: z.string().min(1, { message: 'El país es requerido.' }),
});

export async function addTeam(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = TeamSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    const { name, country, logoUrl } = validatedFields.data;
    const countrySlug = slugify(country);
    const teamSlug = slugify(name);
    
    const teamPath = `teams/${countrySlug}/clubs/${teamSlug}`;
    const teamRef = doc(db, teamPath);

    try {
        const docSnap = await getDoc(teamRef);
        if (docSnap.exists()) {
            return { message: `El equipo con ID '${teamSlug}' ya existe en ese país.`, success: false };
        }

        await setDoc(teamRef, { name, logoUrl, country });
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo añadido exitosamente.', success: true };
    } catch (error) {
        console.error('Error adding team:', error);
        return { message: 'Error del servidor al añadir el equipo.', success: false };
    }
}

export async function updateTeam(path: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!path) return { message: 'Ruta del equipo no proporcionada.', success: false };

    // When updating, we only care about logoUrl, as name and country define the path.
    const UpdateSchema = TeamSchema.pick({ logoUrl: true });
    const validatedFields = UpdateSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    try {
        await updateDoc(doc(db, path), validatedFields.data);
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo actualizado exitosamente.', success: true };
    } catch (error) {
        console.error('Error updating team:', error);
        return { message: 'Error del servidor al actualizar el equipo.', success: false };
    }
}

export async function deleteTeam(path: string) {
    if (!path) return { message: 'Ruta del equipo no proporcionada.', success: false };
    
    try {
        await deleteDoc(doc(db, path));
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo eliminado exitosamente.', success: true };
    } catch (error) {
        console.error('Error deleting team:', error);
        return { message: 'Error del servidor al eliminar el equipo.', success: false };
    }
}

// --- AGENDA ---

const handleMatchAction = async (data: AdminAgendaMatch, existingId?: string) => {
    // Basic validation
    if (!data.tournamentId || !data.team1 || !data.team2 || !data.time) {
        throw new Error('Faltan datos requeridos para guardar el partido.');
    }
    if (data.team1 === data.team2) {
        throw new Error('Los equipos no pueden ser iguales.');
    }

    const { time, ...restOfData } = data;
    const matchTimestamp = Timestamp.fromDate(time);
    const dataToSave = { ...restOfData, time: matchTimestamp };

    if (existingId) {
        // Update existing match
        const matchRef = doc(db, 'agenda', existingId);
        await updateDoc(matchRef, dataToSave);
    } else {
        // Create new match
        const dateString = time.toISOString().split('T')[0];
        const id = `${slugify(data.team1)}-vs-${slugify(data.team2)}-${dateString}`;
        const matchRef = doc(db, 'agenda', id);

        const docSnap = await getDoc(matchRef);
        if (docSnap.exists()) {
            throw new Error(`Un partido con ID '${id}' ya existe.`);
        }
        await setDoc(matchRef, dataToSave);
    }
    
    revalidatePath('/admin/agenda');
    revalidatePath('/');
}

export async function addMatch(prevState: FormState, data: AdminAgendaMatch) {
    try {
        await handleMatchAction(data);
        return { success: true, message: 'Partido añadido exitosamente.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error del servidor al añadir el partido.';
        console.error("Error adding match:", error);
        return { success: false, message: errorMessage };
    }
}

export async function updateMatch(id: string, prevState: FormState, data: AdminAgendaMatch) {
    if (!id) return { success: false, message: 'ID de partido no proporcionado.' };
    try {
        await handleMatchAction(data, id);
        return { success: true, message: 'Partido actualizado exitosamente.' };
    } catch (error) {
        console.error("Error updating match:", error);
        return { success: false, message: 'Error del servidor al actualizar el partido.' };
    }
}

export async function deleteMatch(id: string) {
    if (!id) return { message: 'ID de partido no proporcionado.', success: false };
    
    try {
        await deleteDoc(doc(db, 'agenda', id));
        revalidatePath('/admin/agenda');
        revalidatePath('/');
        return { message: 'Partido eliminado exitosamente.', success: true };
    } catch (error) {
        console.error("Error deleting match:", error);
        return { message: 'Error del servidor al eliminar el partido.', success: false };
    }
}

// Action to fetch all agenda items for the admin panel
export async function getAdminAgenda(): Promise<AdminAgendaMatch[]> {
    try {
        const agendaSnapshot = await getDocs(query(collection(db, "agenda"), orderBy("time", "asc")));
        const matches = agendaSnapshot.docs.map(doc => {
            const data = doc.data();
            const time = (data.time as Timestamp).toDate();
            return {
                id: doc.id,
                team1: data.team1,
                team2: data.team2,
                tournamentId: data.tournamentId,
                channels: data.channels,
                dates: data.dates,
                time: time
            } as AdminAgendaMatch
        });
        
        // This is a simplified version for the admin panel.
        // The page will fetch names separately for display.
        return matches;

    } catch (error) {
        console.error("Error fetching admin agenda:", error);
        return [];
    }
}
