
'use client';

import { useActionState } from 'react';
import { sendNotification } from '@/lib/notification-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFormStatus } from 'react-dom';
import { Loader2, Send } from 'lucide-react';

const initialState = { message: '', success: false, error: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar Notificación a todos los suscriptores
        </Button>
    )
}


export default function NotificationsPage() {
    const [state, formAction] = useActionState(sendNotification, initialState);
    
    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight">Enviar Notificaciones</CardTitle>
                    <CardDescription>
                        Crea y envía notificaciones push a todos los usuarios suscritos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" name="title" placeholder="Ej: ¡Nuevo partido en vivo!" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Mensaje</Label>
                            <Textarea id="message" name="message" placeholder="Ej: No te pierdas el clásico de la jornada." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iconUrl">URL del Ícono (Opcional)</Label>
                            <Input id="iconUrl" name="iconUrl" placeholder="https://ejemplo.com/logo.png" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL de Destino (Opcional)</Label>
                            <Input id="url" name="url" placeholder="/canal/espn-premium" />
                        </div>
                        {state?.message && (
                           <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-destructive'}`}>
                                {state.message}
                            </p>
                        )}
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
