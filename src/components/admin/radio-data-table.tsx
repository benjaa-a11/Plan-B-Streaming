
'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import type { Radio } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { addRadio, updateRadio, deleteRadio } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical, Search } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { SortableUrlList, type UrlItem } from './sortable-url-list';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Radio'}
        </Button>
    )
}

function RadioForm({ radio, onFormSubmit }: { radio?: Radio | null; onFormSubmit: () => void }) {
  const formAction = radio?.id ? updateRadio.bind(null, radio.id) : addRadio;
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();

  const initialUrls = useMemo(() => 
    (radio?.streamUrl || ['']).map((url, index) => ({ id: `${index}-${Date.now()}`, value: url })),
    [radio]
  );
  const [urlItems, setUrlItems] = useState<UrlItem[]>(initialUrls);

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
             ...((state.errors?.streamUrl || state.errors?.streamUrl?.length) && {
                description: (
                    <>
                        {state.message}
                        <ul className="mt-2 list-disc pl-5">
                            {(state.errors.streamUrl as unknown as string[]).map((error: string, index: number) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </>
                )
            })
        });
    }
    state.message = '';
    state.success = false;
    state.errors = {};
  }, [state, onFormSubmit, toast]);
  
  const handleFormAction = (formData: FormData) => {
    urlItems.forEach(item => {
        formData.append('streamUrl[]', item.value);
    });
    dispatch(formData);
  }

  return (
    <form action={handleFormAction}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={radio?.name} />
          {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">URL del Logo</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={radio?.logoUrl} />
           {state.errors?.logoUrl && <p className="text-sm font-medium text-destructive">{state.errors.logoUrl.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="emisora">Emisora (Opcional)</Label>
          <Input id="emisora" name="emisora" defaultValue={radio?.emisora} />
           {state.errors?.emisora && <p className="text-sm font-medium text-destructive">{state.errors.emisora.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Opciones de Streaming</Label>
           <SortableUrlList items={urlItems} setItems={setUrlItems} placeholder="https://ejemplo.com/stream.mp3" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!radio} />
      </DialogFooter>
    </form>
  );
}

function AdminRadioCard({ radio, onEdit, onDelete }: { radio: Radio; onEdit: (radio: Radio) => void; onDelete: (radio: Radio) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={radio.logoUrl} alt={radio.name} width={48} height={48} className="object-contain rounded-md border p-1 h-12 w-12" />
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{radio.name}</p>
                    <p className="text-sm text-muted-foreground">{radio.emisora || 'Radio'}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(radio)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(radio)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function RadioDataTable({ data }: { data: Radio[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return data.filter(radio =>
      radio.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleEditClick = (radio: Radio) => {
    setSelectedRadio(radio);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRadio(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (radio: Radio) => {
    setSelectedRadio(radio);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRadio) return;
    const result = await deleteRadio(selectedRadio.id);
    if(result.success) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Radio Eliminada</span></div>,
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
    setSelectedRadio(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedRadio(null);
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
        <Button onClick={handleAddClick} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Radio
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedRadio ? 'Editar Radio' : 'Añadir Nueva Radio'}</DialogTitle>
            <DialogDescription>
              {selectedRadio ? 'Modifica los detalles de la estación de radio existente.' : 'Completa el formulario para añadir una nueva estación de radio. El ID se generará a partir del nombre.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <RadioForm key={selectedRadio?.id || 'new'} radio={selectedRadio} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar la radio {selectedRadio?.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedRadio(null)}>Cancelar</AlertDialogCancel>
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
              <TableHead>Emisora</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((radio) => (
              <TableRow key={radio.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={radio.logoUrl} alt={radio.name} width={40} height={40} className="object-contain rounded-md border p-1" />
                </TableCell>
                <TableCell className="font-medium">{radio.name}</TableCell>
                <TableCell>{radio.emisora || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(radio)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(radio)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron radios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((radio) => (
             <AdminRadioCard
                key={radio.id}
                radio={radio}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No se encontraron radios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
