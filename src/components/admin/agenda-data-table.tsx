
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AdminAgendaMatch, Channel, Team, Tournament } from '@/types';
import Image from 'next/image';
import { useFormState } from 'react-dom';
import { addMatch, updateMatch, deleteMatch } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, ArrowLeft, Calendar as CalendarIcon, Clock, Shield, Users, Tv, FileText, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

const initialState = { message: '', errors: {}, success: false };

type Option = {
    value: string;
    label: string;
}

type GroupedItems<T> = Record<string, T[]>;

const STEPS = [
  { id: 1, name: 'Torneo', icon: Shield },
  { id: 2, name: 'Equipo 1', icon: Users },
  { id: 3, name: 'Equipo 2', icon: Users },
  { id: 4, name: 'Fecha y Hora', icon: Clock },
  { id: 5, name: 'Canales', icon: Tv },
  { id: 6, name: 'Resumen', icon: FileText },
];

function MatchWizard({ match, onFormSubmit, teams, tournaments, channels }: {
    match?: AdminAgendaMatch | null;
    onFormSubmit: () => void;
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
}) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        tournamentId: match?.tournamentId || '',
        team1: match?.team1 || '',
        team2: match?.team2 || '',
        date: match?.time,
        time: match?.time ? format(match.time, 'HH:mm') : '',
        channels: match?.channels || [],
        dates: match?.dates || '',
    });

    const [selectedCountry, setSelectedCountry] = useState<string | null>(teams.find(t => t.id === formData.team1)?.country || null);
    const [selectedChannelCategory, setSelectedChannelCategory] = useState<string | null>(null);

    const formAction = match?.id ? updateMatch.bind(null, match.id) : addMatch;
    const [state, dispatch] = useFormState(formAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            toast({
                title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Éxito</span></div>,
                description: state.message
            });
            onFormSubmit();
        } else if (state.message) {
            toast({
                variant: 'destructive',
                title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
                description: state.message
            });
        }
    }, [state, onFormSubmit, toast]);
    
    const groupedTeams = useMemo(() => teams.reduce<GroupedItems<Team>>((acc, team) => {
        const country = team.country || 'Sin País';
        if (!acc[country]) acc[country] = [];
        acc[country].push(team);
        return acc;
    }, {}), [teams]);

    const groupedChannels = useMemo(() => channels.reduce<GroupedItems<Channel>>((acc, channel) => {
        const category = channel.category || 'Sin Categoría';
        if (!acc[category]) acc[category] = [];
        acc[category].push(channel);
        return acc;
    }, {}), [channels]);

    const handleNextStep = () => setStep(prev => Math.min(prev + 1, STEPS.length));
    const handlePrevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSelect = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleChannelToggle = (channelId: string) => {
        setFormData(prev => {
            const newChannels = prev.channels.includes(channelId)
                ? prev.channels.filter(id => id !== channelId)
                : [...prev.channels, channelId];
            return { ...prev, channels: newChannels };
        });
    };

    const renderStepContent = () => {
      switch(step) {
        case 1: // Tournament Selection
            return (
                <ScrollArea className="flex-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                        {tournaments.map(t => (
                            <Card
                                key={t.id}
                                onClick={() => { handleSelect('tournamentId', t.tournamentId); handleNextStep(); }}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 hover:shadow-primary/20 hover:-translate-y-1",
                                    formData.tournamentId === t.tournamentId && "ring-2 ring-primary"
                                )}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center aspect-square">
                                    <Image unoptimized src={t.logoUrl?.[0] || 'https://placehold.co/128x128.png'} alt={t.name} width={64} height={64} className="h-16 w-16 object-contain" />
                                    <p className="text-xs font-semibold">{t.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            );

        case 2: // Team 1 Selection
        case 3: // Team 2 Selection
            const currentTeamField = step === 2 ? 'team1' : 'team2';
            const currentTeam = formData[currentTeamField];
            
            return (
                <div className="flex flex-col md:flex-row gap-4 flex-auto min-h-0">
                    <div className="md:w-1/3 border-r pr-4">
                        <h3 className="font-semibold mb-2">País</h3>
                        <ScrollArea>
                            <div className="space-y-1">
                                {Object.keys(groupedTeams).sort().map(country => (
                                    <Button key={country} variant={selectedCountry === country ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedCountry(country)}>
                                        {country}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <ScrollArea className="md:w-2/3">
                         <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-1">
                            {selectedCountry && groupedTeams[selectedCountry]?.map(team => (
                                <Card
                                    key={team.id}
                                    onClick={() => {
                                        if (formData.team1 !== team.id) { // Prevent selecting same team twice
                                            handleSelect(currentTeamField, team.id);
                                            handleNextStep();
                                        }
                                    }}
                                    className={cn(
                                        "cursor-pointer transition-all duration-200 hover:shadow-primary/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
                                        currentTeam === team.id && "ring-2 ring-primary",
                                        formData.team1 === team.id && currentTeamField === 'team2' && "opacity-50 cursor-not-allowed"
                                    )}
                                    title={team.name}
                                    aria-disabled={formData.team1 === team.id && currentTeamField === 'team2'}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-2 sm:p-4 gap-2 text-center aspect-square">
                                        <Image unoptimized src={team.logoUrl} alt={team.name} width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
                                        <p className="text-[10px] sm:text-xs font-semibold leading-tight">{team.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            );
        
        case 4: // Date and Time
          return (
              <div className="flex-auto p-4 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                          <Label>Fecha del Partido</Label>
                          <Calendar
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) => handleSelect('date', date)}
                              className="rounded-md border mt-1"
                              initialFocus
                          />
                      </div>
                      <div>
                          <Label htmlFor="time">Hora del Partido (Formato 24hs - AR)</Label>
                          <Input id="time" name="time" type="time" value={formData.time} onChange={(e) => handleSelect('time', e.target.value)} className="mt-1" />
                      </div>
                  </div>
              </div>
          );

        case 5: // Channel Selection
            return (
                <div className="flex flex-col md:flex-row gap-4 flex-auto min-h-0">
                    <div className="md:w-1/3 border-r pr-4">
                        <h3 className="font-semibold mb-2">Categoría</h3>
                        <ScrollArea>
                            <div className="space-y-1">
                                {Object.keys(groupedChannels).sort().map(cat => (
                                    <Button key={cat} variant={selectedChannelCategory === cat ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedChannelCategory(cat)}>
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <ScrollArea className="md:w-2/3 p-1">
                        <div className="space-y-2">
                          {selectedChannelCategory && groupedChannels[selectedChannelCategory]?.map(channel => (
                            <div key={channel.id} onClick={() => handleChannelToggle(channel.id)} className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors">
                              <Checkbox checked={formData.channels.includes(channel.id)} onCheckedChange={() => handleChannelToggle(channel.id)} />
                              <Image unoptimized src={channel.logoUrl} alt={channel.name} width={32} height={32} className="h-8 w-8 object-contain" />
                              <Label className="font-medium cursor-pointer">{channel.name}</Label>
                            </div>
                          ))}
                        </div>
                    </ScrollArea>
                </div>
            );

        case 6: // Summary
            const t1 = teams.find(t => t.id === formData.team1);
            const t2 = teams.find(t => t.id === formData.team2);
            const tourney = tournaments.find(t => t.tournamentId === formData.tournamentId);
            const selectedChannels = channels.filter(c => formData.channels.includes(c.id));
            
            return (
                <form action={dispatch} className="flex-auto overflow-y-auto p-4 space-y-4">
                     {/* Hidden inputs to submit data */}
                    <input type="hidden" name="tournamentId" value={formData.tournamentId} />
                    <input type="hidden" name="team1" value={formData.team1} />
                    <input type="hidden" name="team2" value={formData.team2} />
                    <input type="hidden" name="date" value={formData.date ? formData.date.toISOString().split('T')[0] : ''} />
                    <input type="hidden" name="time" value={formData.time} />
                    {formData.channels.map(cId => <input key={cId} type="hidden" name="channels" value={cId} />)}
                    
                    <h3 className="font-bold text-lg text-center">Resumen del Partido</h3>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-around items-center text-center">
                                <div className="w-1/3 space-y-2">
                                    <Image unoptimized src={t1?.logoUrl || 'https://placehold.co/64x64.png'} alt={t1?.name || ''} width={48} height={48} className="mx-auto h-12 w-12 object-contain" />
                                    <p className="font-semibold text-sm">{t1?.name}</p>
                                </div>
                                <p className="font-bold text-muted-foreground">VS</p>
                                <div className="w-1/3 space-y-2">
                                    <Image unoptimized src={t2?.logoUrl || 'https://placehold.co/64x64.png'} alt={t2?.name || ''} width={48} height={48} className="mx-auto h-12 w-12 object-contain" />
                                    <p className="font-semibold text-sm">{t2?.name}</p>
                                </div>
                            </div>
                            <div className="text-center space-y-1 pt-2 border-t">
                                <Image unoptimized src={tourney?.logoUrl?.[0] || 'https://placehold.co/40x40.png'} alt={tourney?.name || ''} width={32} height={32} className="mx-auto h-8 w-8 object-contain" />
                                <p className="text-sm font-medium">{tourney?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formData.date ? format(formData.date, 'PPP', {}) : 'Sin fecha'} a las {formData.time || '00:00'} hs
                                </p>
                            </div>
                            <div className="pt-2 border-t">
                                <h4 className="font-semibold text-sm mb-2">Canales de Transmisión</h4>
                                {selectedChannels.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedChannels.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">Ninguno seleccionado</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <div>
                        <Label htmlFor="dates">Texto Adicional (Ej: Jornada, Grupo)</Label>
                        <Input id="dates" name="dates" value={formData.dates} onChange={(e) => handleSelect('dates', e.target.value)} />
                    </div>
                </form>
            );
        }
    };
    
    const isNextDisabled = () => {
        switch(step) {
            case 1: return !formData.tournamentId;
            case 2: return !formData.team1;
            case 3: return !formData.team2;
            case 4: return !formData.date || !formData.time;
            case 5: return false; // Can proceed without channels
            default: return false;
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <Progress value={(step / STEPS.length) * 100} className="w-full mb-2" />
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Paso {step} de {STEPS.length}</p>
                        <p className="font-semibold">{STEPS[step - 1].name}</p>
                    </div>
                    {step > 1 && (
                      <Button variant="ghost" size="sm" onClick={handlePrevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
                    )}
                </div>
            </div>
            
            <div className="flex-grow p-4 min-h-0 flex flex-col">
              {renderStepContent()}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
                {step < STEPS.length ? (
                    <Button onClick={handleNextStep} disabled={isNextDisabled()}>Siguiente</Button>
                ) : (
                    <Button type="submit" formAction={formAction} disabled={!formData.team1 || !formData.team2 || !formData.tournamentId || !formData.date || !formData.time}>
                        {match ? 'Guardar Cambios' : 'Crear Partido'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function AgendaDataTable({ data, teams, tournaments, channels }: {
    data: AdminAgendaMatch[];
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
    tournamentOptions: Option[]; // Keep for potential future use or remove if fully deprecated
}) {
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
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Eliminado</span></div>,
        description: result.message 
      });
    } else {
      toast({ 
        variant: "destructive", 
        title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>, 
        description: result.message
      });
    }
  }

  const handleFormSubmit = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMatch(null);
  }, []);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Partido
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{selectedMatch ? 'Editar Partido' : 'Programar Nuevo Partido'}</DialogTitle>
            <DialogDescription>
              {selectedMatch ? 'Modifica los detalles del partido existente.' : 'Usa el asistente para programar un nuevo partido.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow min-h-0">
              <MatchWizard 
                match={selectedMatch} 
                onFormSubmit={handleFormSubmit}
                teams={teams}
                tournaments={tournaments}
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

