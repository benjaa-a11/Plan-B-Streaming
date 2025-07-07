'use client';

import { useState, useEffect } from 'react';
import type { AdminAgendaMatch, Channel, Team, Tournament } from '@/types';
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
import { addMatch, updateMatch, deleteMatch } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

const initialState = { message: '', errors: {}, success: false };

type Option = {
    value: string;
    label: string;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Partido'}
        </Button>
    )
}

function MatchForm({ match, onFormSubmit, teamOptions, tournamentOptions, channelOptions }: { 
    match?: AdminAgendaMatch | null; 
    onFormSubmit: () => void;
    teamOptions: Option[];
    tournamentOptions: Option[];
    channelOptions: Option[];
}) {
  const formAction = match?.id ? updateMatch.bind(null, match.id) : addMatch;
  const [state, dispatch] = useFormState(formAction, initialState);
  const [date, setDate] = useState<Date | undefined>(match?.time);
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
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="team1">Equipo 1</Label>
                <Select name="team1" defaultValue={match?.team1}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
                    <SelectContent><ScrollArea className="h-72">{teamOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</ScrollArea></SelectContent>
                </Select>
                 {state.errors?.team1 && <p className="text-sm font-medium text-destructive">{state.errors.team1.join(', ')}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="team2">Equipo 2</Label>
                <Select name="team2" defaultValue={match?.team2}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
                    <SelectContent><ScrollArea className="h-72">{teamOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</ScrollArea></SelectContent>
                </Select>
                {state.errors?.team2 && <p className="text-sm font-medium text-destructive">{state.errors.team2.join(', ')}</p>}
            </div>
        </div>

        <div className="grid gap-2">
            <Label htmlFor="tournamentId">Torneo</Label>
            <Select name="tournamentId" defaultValue={match?.tournamentId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar torneo" /></SelectTrigger>
                <SelectContent><ScrollArea className="h-72">{tournamentOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</ScrollArea></SelectContent>
            </Select>
            {state.errors?.tournamentId && <p className="text-sm font-medium text-destructive">{state.errors.tournamentId.join(', ')}</p>}
        </div>
        
        <div className='grid grid-cols-2 gap-4'>
            <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Elegir fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <input type="hidden" name="date" value={date ? date.toISOString().split('T')[0] : ''} />
                {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date.join(', ')}</p>}
            </div>
            <div className='grid gap-2'>
                <Label htmlFor="time">Hora (HH:mm)</Label>
                <Input name="time" type="time" defaultValue={match?.time ? format(match.time, 'HH:mm') : ''}/>
                {state.errors?.time && <p className="text-sm font-medium text-destructive">{state.errors.time.join(', ')}</p>}
            </div>
        </div>

        <div className="grid gap-2">
            <Label>Canales de Transmisión</Label>
            <ScrollArea className="h-40 rounded-md border p-4">
                <div className='space-y-2'>
                {channelOptions.map(c => (
                    <div key={c.value} className="flex items-center gap-2">
                        <Checkbox 
                            id={`channel-${c.value}`} 
                            name="channels" 
                            value={c.value}
                            defaultChecked={match?.channels?.includes(c.value)}
                        />
                        <Label htmlFor={`channel-${c.value}`}>{c.label}</Label>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>

        <div className="grid gap-2">
            <Label htmlFor="dates">Texto Adicional (Ej: Jornada, Grupo)</Label>
            <Input name="dates" defaultValue={match?.dates} />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!match} />
      </DialogFooter>
    </form>
  );
}

type DataTableProps = {
    data: AdminAgendaMatch[];
    teamOptions: Option[];
    tournamentOptions: Option[];
    channelOptions: Option[];
}

export default function AgendaDataTable({ data, teamOptions, tournamentOptions, channelOptions }: DataTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<AdminAgendaMatch | null>(null);
  const { toast } = useToast();

  const handleEditClick = (match: AdminAgendaMatch) => {
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMatch(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteMatch(id);
    if(result.success) {
      toast({ title: "Partido eliminado", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedMatch(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Partido
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMatch ? 'Editar Partido' : 'Programar Nuevo Partido'}</DialogTitle>
            <DialogDescription>
              {selectedMatch ? 'Modifica los detalles del partido existente.' : 'Completa el formulario para añadir un nuevo partido a la agenda.'}
            </DialogDescription>
          </DialogHeader>
          <MatchForm 
            match={selectedMatch} 
            onFormSubmit={handleFormSubmit}
            teamOptions={teamOptions}
            tournamentOptions={tournamentOptions}
            channelOptions={channelOptions}
          />
        </DialogContent>
      </Dialog>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead>Torneo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{format(match.time, 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell className="font-medium">{match.team1Name} vs {match.team2Name}</TableCell>
                <TableCell>{match.tournamentName}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(match)}>
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
                                  <AlertDialogTitle>¿Estás seguro de eliminar este partido?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(match.id)} className="bg-destructive hover:bg-destructive/90">
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
                  No hay partidos en la agenda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
