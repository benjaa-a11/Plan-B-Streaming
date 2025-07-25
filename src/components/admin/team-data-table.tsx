
'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import type { Team } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { addTeam, updateTeam, deleteTeam } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical, Search } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Equipo'}
        </Button>
    )
}

function TeamForm({ team, onFormSubmit }: { team?: Team | null; onFormSubmit: () => void }) {
  const formAction = team?.id ? updateTeam.bind(null, team.path) : addTeam;
  const [state, dispatch, isPending] = useActionState(formAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (isPending) return;
    if (state.message) {
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
    }
  }, [state, isPending, onFormSubmit, toast]);


  return (
    <form action={dispatch}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre del Equipo</Label>
          <Input id="name" name="name" defaultValue={team?.name} disabled={!!team} />
          {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name.join(', ')}</p>}
           {!!team && <p className="text-xs text-muted-foreground mt-1">El nombre no se puede cambiar ya que forma parte del ID del documento.</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">URL del Logo</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={team?.logoUrl} />
           {state.errors?.logoUrl && <p className="text-sm font-medium text-destructive">{state.errors.logoUrl.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" defaultValue={team?.country} disabled={!!team} />
           {state.errors?.country && <p className="text-sm font-medium text-destructive">{state.errors.country.join(', ')}</p>}
           {!!team && <p className="text-xs text-muted-foreground mt-1">El país no se puede cambiar ya que forma parte de la ruta del documento.</p>}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!team} />
      </DialogFooter>
    </form>
  );
}

function AdminTeamCard({ team, onEdit, onDelete }: { team: Team; onEdit: (team: Team) => void; onDelete: (team: Team) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={team.logoUrl} alt={team.name} width={48} height={48} className="object-contain rounded-md border p-1 h-12 w-12" />
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.country}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(team)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(team)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function TeamDataTable({ data }: { data: Team[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const { toast } = useToast();

  const countries = useMemo(() => ['all', ...Array.from(new Set(data.map(t => t.country)))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = countryFilter === 'all' || team.country === countryFilter;
      return matchesSearch && matchesCountry;
    });
  }, [data, searchTerm, countryFilter]);

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTeam(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeam) return;
    const result = await deleteTeam(selectedTeam.path);
    if(result.success) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Equipo Eliminado</span></div>,
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
    setSelectedTeam(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedTeam(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2 md:gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country === 'all' ? 'Todos los países' : country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddClick} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Equipo
          </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTeam ? 'Editar Equipo' : 'Añadir Nuevo Equipo'}</DialogTitle>
            <DialogDescription>
              {selectedTeam ? 'Modifica los detalles del equipo existente.' : 'Completa el formulario para añadir un nuevo equipo. El ID se generará a partir del nombre y país.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <TeamForm key={selectedTeam?.id || 'new'} team={selectedTeam} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar el equipo {selectedTeam?.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedTeam(null)}>Cancelar</AlertDialogCancel>
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
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>País</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((team) => (
              <TableRow key={team.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={team.logoUrl} alt={team.name} width={40} height={40} className="object-contain rounded-md border p-1" />
                </TableCell>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.country}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(team)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(team)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron equipos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

        {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((team) => (
             <AdminTeamCard
                key={team.id}
                team={team}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No se encontraron equipos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
