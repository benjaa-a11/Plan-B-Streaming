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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

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
        toast({
            title: (
                <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-foreground">Éxito</p>
                        <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
                    </div>
                </div>
            )
        });
        onFormSubmit();
    } else if (state.message && !Object.keys(state.errors ?? {}).length) {
        toast({
            variant: 'destructive',
            title: (
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive-foreground mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-destructive-foreground">Error</p>
                        <p className="text-sm text-destructive-foreground/80 mt-1">{state.message}</p>
                    </div>
                </div>
            )
        });
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

function AdminTournamentCard({ tournament, onEdit, onDelete }: { tournament: Tournament; onEdit: (tournament: Tournament) => void; onDelete: (id: string, name: string) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                {tournament.logoUrl?.[0] ? (
                    <Image unoptimized src={tournament.logoUrl[0]} alt={tournament.name} width={48} height={48} className="object-contain rounded-md border p-1 bg-white h-12 w-12" />
                  ): (
                    <div className="w-12 h-12 rounded-md border bg-muted flex-shrink-0" />
                  )}
                <div className="flex-1 space-y-1 min-w-0">
                    <p className="font-semibold truncate">{tournament.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                        <code className="bg-muted px-2 py-1 rounded-md text-xs">{tournament.tournamentId}</code>
                    </p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(tournament)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(tournament.id, tournament.name)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
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
      toast({
        title: (
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-foreground">Torneo Eliminado</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                </div>
            </div>
        )
      });
    } else {
      toast({
        variant: 'destructive',
        title: (
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive-foreground mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-destructive-foreground">Error</p>
                    <p className="text-sm text-destructive-foreground/80 mt-1">{result.message}</p>
                </div>
            </div>
        )
      });
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
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTournament ? 'Editar Torneo' : 'Añadir Nuevo Torneo'}</DialogTitle>
            <DialogDescription>
              {selectedTournament ? 'Modifica los detalles del torneo existente.' : 'Completa el formulario para añadir un nuevo torneo a la aplicación. El ID se generará a partir del nombre.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <TournamentForm tournament={selectedTournament} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
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
              <TableRow key={tournament.id} className="opacity-0 animate-fade-in-up">
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
                                  <AlertDialogTitle>¿Eliminar el torneo {tournament.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
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

       {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((tournament, index) => (
             <AdminTournamentCard
                key={tournament.id}
                tournament={tournament}
                onEdit={handleEditClick}
                onDelete={(id, name) => {
                   const trigger = document.createElement('button');
                   document.body.appendChild(trigger);
                   const dialog = (
                       <AlertDialog open={true} onOpenChange={(open) => !open && trigger.remove()}>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>¿Eliminar el torneo {name}?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                       Esta acción no se puede deshacer.
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDelete(id)} className="bg-destructive hover:bg-destructive/90">
                                       Eliminar
                                   </AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                   );
                   const { createRoot } = require('react-dom/client');
                   createRoot(trigger).render(dialog);
                }}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No hay torneos para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  );
}