'use client';

import { useState, useEffect } from 'react';
import type { Tournament } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState, useFormStatus } from 'react-dom';
import { addTournament, updateTournament, deleteTournament } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Torneo'}
        </Button>
    )
}

function TournamentForm({ tournament, onFormSubmit }: { tournament?: Tournament | null; onFormSubmit: () => void }) {
  const formAction = tournament?.id ? updateTournament.bind(null, tournament.id) : addTournament;
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if(state.success) {
        toast({ title: "Éxito", description: state.message });
        onFormSubmit();
    } else if (state.message && !Object.keys(state.errors ?? {}).length) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
    }
  }, [state, onFormSubmit, toast]);

  return (
    <form action={dispatch}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre del Torneo</Label>
          <Input id="name" name="name" defaultValue={tournament?.name} />
          {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name.join(', ')}</p>}
        </div>
         <div className="grid gap-2">
          <Label htmlFor="tournamentId">ID (para enlazar)</Label>
          <Input id="tournamentId" name="tournamentId" defaultValue={tournament?.tournamentId} placeholder="ej: liga-profesional-arg" />
          {state.errors?.tournamentId && <p className="text-sm font-medium text-destructive">{state.errors.tournamentId.join(', ')}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="logoUrlDark">URL del Logo (Tema Oscuro)</Label>
                <Input id="logoUrlDark" name="logoUrlDark" defaultValue={tournament?.logoUrl?.[0]} />
                {state.errors?.logoUrlDark && <p className="text-sm font-medium text-destructive">{state.errors.logoUrlDark.join(', ')}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="logoUrlLight">URL del Logo (Tema Claro)</Label>
                <Input id="logoUrlLight" name="logoUrlLight" defaultValue={tournament?.logoUrl?.[1]} />
                {state.errors?.logoUrlLight && <p className="text-sm font-medium text-destructive">{state.errors.logoUrlLight.join(', ')}</p>}
            </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!tournament} />
      </DialogFooter>
    </form>
  );
}

export default function TournamentDataTable({ data }: { data: Tournament[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const { toast } = useToast();

  const handleEditClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTournament(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteTournament(id);
    if(result.success) {
      toast({ title: "Torneo eliminado", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedTournament(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Torneo
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedTournament ? 'Editar Torneo' : 'Añadir Nuevo Torneo'}</DialogTitle>
            <DialogDescription>
              {selectedTournament ? 'Modifica los detalles del torneo existente.' : 'Completa el formulario para añadir un nuevo torneo a la aplicación. El ID se generará a partir del nombre.'}
            </DialogDescription>
          </DialogHeader>
          <TournamentForm tournament={selectedTournament} onFormSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>ID de Enlace</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>
                  {tournament.logoUrl?.[0] ? (
                    <Image unoptimized src={tournament.logoUrl[0]} alt={tournament.name} width={40} height={40} className="object-contain rounded-md border p-1 bg-white" />
                  ): (
                    <div className="w-10 h-10 rounded-md border bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{tournament.name}</TableCell>
                <TableCell>
                    <code className="bg-muted px-2 py-1 rounded-md text-xs">{tournament.tournamentId}</code>
                </TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(tournament)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro de eliminar este torneo?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará el torneo <strong>{tournament.name}</strong> permanentemente.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(tournament.id)} className="bg-destructive hover:bg-destructive/90">
                                      Eliminar
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay torneos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
