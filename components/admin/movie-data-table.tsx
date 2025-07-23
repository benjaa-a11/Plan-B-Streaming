
'use client';

import { useState, useEffect, useActionState } from 'react';
import type { Movie } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormStatus } from 'react-dom';
import { addMovie, updateMovie, deleteMovie } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Película'}
        </Button>
    )
}

function MovieForm({ movie, onFormSubmit }: { movie?: Movie | null; onFormSubmit: () => void }) {
  const formAction = movie?.id ? updateMovie.bind(null, movie.id) : addMovie;
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
        toast({
            title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Éxito</span></div>,
            description: state.message,
        });
        onFormSubmit();
    } else {
        toast({
            variant: 'destructive',
            title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
            description: state.message,
        });
    }
    // Reset state after showing toast
    state.message = '';
    state.success = false;
    state.errors = {};
  }, [state, onFormSubmit, toast]);

  return (
    <form action={dispatch}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="tmdbID">ID de TMDb</Label>
          <Input id="tmdbID" name="tmdbID" defaultValue={movie?.tmdbID} placeholder="Ej: 157336" />
          {state.errors?.tmdbID && <p className="text-sm font-medium text-destructive">{state.errors.tmdbID.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="streamUrl">URL del Stream</Label>
          <Input id="streamUrl" name="streamUrl" defaultValue={movie?.streamUrl} placeholder="URL .mp4 o de iframe" />
           {state.errors?.streamUrl && <p className="text-sm font-medium text-destructive">{state.errors.streamUrl.join(', ')}</p>}
        </div>
         <div className="grid gap-2">
          <Label>Formato</Label>
          <RadioGroup name="format" defaultValue={movie?.format || 'mp4'} className="flex gap-4">
             <div className="flex items-center space-x-2">
                <RadioGroupItem value="mp4" id="mp4" />
                <Label htmlFor="mp4">MP4 (Player Nativo)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="iframe" id="iframe" />
                <Label htmlFor="iframe">Iframe (Player Externo)</Label>
            </div>
          </RadioGroup>
          {state.errors?.format && <p className="text-sm font-medium text-destructive">{state.errors.format.join(', ')}</p>}
        </div>
        <div className='p-4 border rounded-md bg-muted/50'>
            <h4 className="font-semibold mb-2 text-sm">Campos Opcionales</h4>
            <p className="text-xs text-muted-foreground mb-4">Déjalos en blanco para usar los datos de TMDb automáticamente. El ID del documento se generará a partir del título.</p>
             <div className="grid gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="title">Título (Opcional)</Label>
                    <Input id="title" name="title" defaultValue={movie?.title} />
                     {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title.join(', ')}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="posterUrl">URL de Póster (Opcional)</Label>
                    <Input id="posterUrl" name="posterUrl" defaultValue={movie?.posterUrl} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="heroImageUrl">URL de Imagen para Hero (Opcional)</Label>
                    <Input id="heroImageUrl" name="heroImageUrl" defaultValue={movie?.heroImageUrl} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="synopsis">Sinopsis (Opcional)</Label>
                    <Textarea id="synopsis" name="synopsis" defaultValue={movie?.synopsis} />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="isHero" name="isHero" defaultChecked={movie?.isHero} />
                    <Label htmlFor="isHero">Destacar en el Hero</Label>
                </div>
             </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!movie} />
      </DialogFooter>
    </form>
  );
}

function AdminMovieCard({ movie, onEdit, onDelete }: { movie: Movie; onEdit: (movie: Movie) => void; onDelete: (movie: Movie) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={movie.posterUrl} alt={movie.title} width={48} height={72} className="object-cover rounded-md border p-1 h-18 w-12" />
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">Formato: {movie.format}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(movie)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(movie)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}


export default function MovieDataTable({ data }: { data: Movie[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { toast } = useToast();

  const handleEditClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMovie(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMovie) return;
    const result = await deleteMovie(selectedMovie.id);
    if(result.success) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Película Eliminada</span></div>,
        description: result.message
      });
    } else {
      toast({
        variant: 'destructive',
        title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
        description: result.message
      });
    }
    setIsAlertOpen(false);
    setSelectedMovie(null);
  }

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Película
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedMovie ? 'Editar Película' : 'Añadir Nueva Película'}</DialogTitle>
            <DialogDescription>
              {selectedMovie ? 'Modifica los detalles de la película existente.' : 'Completa el formulario para añadir una nueva película a la aplicación.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <MovieForm key={selectedMovie?.id || 'new'} movie={selectedMovie} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar la película {selectedMovie?.title}?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedMovie(null)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                      Eliminar
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Póster</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Hero</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((movie) => (
              <TableRow key={movie.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={movie.posterUrl} alt={movie.title} width={40} height={60} className="object-cover rounded-md border p-1" />
                </TableCell>
                <TableCell className="font-medium">{movie.title}</TableCell>
                <TableCell>{movie.format}</TableCell>
                <TableCell>{movie.isHero ? 'Sí' : 'No'}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(movie)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(movie)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay películas para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((movie) => (
             <AdminMovieCard
                key={movie.id}
                movie={movie}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No hay películas para mostrar.</p>
          </div>
        )}
      </div>

    </div>
  );
}
