
'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import type { Channel } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormStatus } from 'react-dom';
import { addChannel, updateChannel, deleteChannel } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { SortableUrlList, type UrlItem } from './sortable-url-list';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Canal'}
        </Button>
    )
}

function ChannelForm({ channel, onFormSubmit }: { channel?: Channel | null; onFormSubmit: () => void }) {
  const formAction = channel?.id ? updateChannel.bind(null, channel.id) : addChannel;
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();

  const initialUrls = useMemo(() => 
    (channel?.streamUrl || ['']).map((url, index) => ({ id: `${index}-${Date.now()}`, value: url })),
    [channel]
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
          <Input id="name" name="name" defaultValue={channel?.name} />
          {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">URL del Logo</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={channel?.logoUrl} />
           {state.errors?.logoUrl && <p className="text-sm font-medium text-destructive">{state.errors.logoUrl.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Categoría</Label>
          <Input id="category" name="category" defaultValue={channel?.category} />
           {state.errors?.category && <p className="text-sm font-medium text-destructive">{state.errors.category.join(', ')}</p>}
        </div>
        
        <div className="grid gap-2">
          <Label>Opciones de Streaming</Label>
          <SortableUrlList items={urlItems} setItems={setUrlItems} placeholder="https://ejemplo.com/stream.m3u8" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" defaultValue={channel?.description} />
           {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Checkbox id="isHidden" name="isHidden" defaultChecked={channel?.isHidden} />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="isHidden" className="font-semibold cursor-pointer">
                Ocultar Canal
              </Label>
              <p className="text-sm text-muted-foreground">
                Si se activa, el canal no aparecerá en la grilla principal, pero podrá usarse para eventos.
              </p>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!channel} />
      </DialogFooter>
    </form>
  );
}

function AdminChannelCard({ channel, onEdit, onDelete }: { channel: Channel; onEdit: (channel: Channel) => void; onDelete: (channel: Channel) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image src={channel.logoUrl} alt={channel.name} width={48} height={48} className="object-contain rounded-md border p-1 h-12 w-12" unoptimized/>
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{channel.name}</p>
                    <p className="text-sm text-muted-foreground">{channel.category}</p>
                    <Badge variant={channel.isHidden ? "secondary" : "outline"}>
                        {channel.isHidden ? "Oculto" : "Visible"}
                    </Badge>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(channel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(channel)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function ChannelDataTable({ data }: { data: Channel[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { toast } = useToast();

  const handleEditClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedChannel(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedChannel) return;

    const result = await deleteChannel(selectedChannel.id);
    if(result.success) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Canal Eliminado</span></div>,
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
    setSelectedChannel(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedChannel(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Canal
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedChannel ? 'Editar Canal' : 'Añadir Nuevo Canal'}</DialogTitle>
            <DialogDescription>
              {selectedChannel ? 'Modifica los detalles del canal existente.' : 'Completa el formulario para añadir un nuevo canal. El ID se generará a partir del nombre.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <ChannelForm key={selectedChannel?.id || 'new'} channel={selectedChannel} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar el canal {selectedChannel?.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedChannel(null)}>Cancelar</AlertDialogCancel>
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
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((channel) => (
              <TableRow key={channel.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image src={channel.logoUrl} alt={channel.name} width={40} height={40} className="object-contain rounded-md border p-1" unoptimized/>
                </TableCell>
                <TableCell className="font-medium">{channel.name}</TableCell>
                <TableCell>{channel.category}</TableCell>
                <TableCell>
                  <Badge variant={channel.isHidden ? "secondary" : "outline"}>
                    {channel.isHidden ? "Oculto" : "Visible"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(channel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(channel)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay canales para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((channel) => (
             <AdminChannelCard
                key={channel.id}
                channel={channel}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No hay canales para mostrar.</p>
          </div>
        )}
      </div>

    </div>
  );
}
