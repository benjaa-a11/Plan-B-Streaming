'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, Edit, Trash2, Loader2, Calendar as CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '../ui/select';
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

function MatchForm({ match, onFormSubmit, teams, tournamentOptions, channels }: { 
    match?: AdminAgendaMatch | null; 
    onFormSubmit: () => void;
    teams: Team[];
    tournamentOptions: Option[];
    channels: Channel[];
}) {
  const formAction = match?.id ? updateMatch.bind(null, match.id) : addMatch;
  const [state, dispatch] = useFormState(formAction, initialState);
  const [date, setDate] = useState<Date | undefined>(match?.time);
  const { toast } = useToast();

  useEffect(() => {
    if(state.success) {
        toast({ 
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Éxito</span>
            </div>
          ),
          description: state.message 
        });
        onFormSubmit();
    } else if (state.message && !Object.keys(state.errors ?? {}).length) {
        toast({ 
          variant: 'destructive', 
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Error</span>
            </div>
          ), 
          description: state.message 
        });
    }
  }, [state, onFormSubmit, toast]);

  const groupedTeams = useMemo(() => {
    return teams.reduce<Record<string, Option[]>>((acc, team) => {
      const country = team.country || 'Sin País';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push({ value: team.id, label: team.name });
      return acc;
    }, {});
  }, [teams]);

  const groupedChannels = useMemo(() => {
    return channels.reduce<Record<string, Option[]>>((acc, channel) => {
        const category = channel.category || 'Sin Categoría';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push({ value: channel.id, label: channel.name });
        return acc;
    }, {});
  }, [channels]);

  return (
    <form action={dispatch}>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="team1">Equipo 1</Label>
                <Select name="team1" defaultValue={match?.team1}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
                    <SelectContent>
                        <ScrollArea className="h-72">
                            {Object.entries(groupedTeams).map(([country, teamOptions]) => (
                                <SelectGroup key={country}>
                                    <SelectLabel>{country}</SelectLabel>
                                    {teamOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectGroup>
                            ))}
                        </ScrollArea>
                    </SelectContent>
                </Select>
                 {state.errors?.team1 && <p className="text-sm font-medium text-destructive">{state.errors.team1.join(', ')}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="team2">Equipo 2</Label>
                <Select name="team2" defaultValue={match?.team2}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
                    <SelectContent>
                       <ScrollArea className="h-72">
                            {Object.entries(groupedTeams).map(([country, teamOptions]) => (
                                <SelectGroup key={country}>
                                    <SelectLabel>{country}</SelectLabel>
                                    {teamOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectGroup>
                            ))}
                        </ScrollArea>
                    </SelectContent>
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
                <Label htmlFor="time">Hora (HH:mm - Arg)</Label>
                <Input name="time" type="time" defaultValue={match?.time ? format(match.time, 'HH:mm') : ''}/>
                {state.errors?.time && <p className="text-sm font-medium text-destructive">{state.errors.time.join(', ')}</p>}
            </div>
        </div>

        <div className="grid gap-2">
            <Label>Canales de Transmisión</Label>
            <ScrollArea className="h-40 rounded-md border p-4">
                <div className='space-y-4'>
                {Object.entries(groupedChannels).map(([category, channelOptions]) => (
                    <div key={category} className="space-y-2">
                        <Label className="font-semibold">{category}</Label>
                        {channelOptions.map(c => (
                             <div key={c.value} className="flex items-center gap-2 pl-2">
                                <Checkbox 
                                    id={`channel-${c.value}`} 
                                    name="channels" 
                                    value={c.value}
                                    defaultChecked={match?.channels?.includes(c.value)}
                                />
                                <Label htmlFor={`channel-${c.value}`} className="font-normal">{c.label}</Label>
                            </div>
                        ))}
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
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
    tournamentOptions: Option[];
}

export default function AgendaDataTable({ data, teams, tournamentOptions, channels }: DataTableProps) {
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
      toast({ 
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Eliminado</span>
          </div>
        ),
        description: result.message 
      });
    } else {
      toast({ 
        variant: "destructive", 
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Error</span>
          </div>
        ), 
        description: result.message
      });
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedMatch ? 'Editar Partido' : 'Programar Nuevo Partido'}</DialogTitle>
            <DialogDescription>
              {selectedMatch ? 'Modifica los detalles del partido existente.' : 'Completa el formulario para añadir un nuevo partido a la agenda.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4">
              <MatchForm 
                match={selectedMatch} 
                onFormSubmit={handleFormSubmit}
                teams={teams}
                tournamentOptions={tournamentOptions}
                channels={channels}
              />
          </div>
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
