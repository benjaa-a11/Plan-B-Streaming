'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/lib/auth-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv, KeyRound, Loader2 } from 'lucide-react';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            Ingresar
        </Button>
    )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, { error: undefined });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader className="text-center">
                 <div className="flex justify-center items-center gap-2 mb-2">
                    <Tv className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Plan B Admin</h1>
                </div>
                <CardTitle>Acceso al Panel</CardTitle>
                <CardDescription>
                    Ingresa la contraseña para administrar el sitio.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            required 
                        />
                    </div>
                     {state?.error && (
                        <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                            {state.error}
                        </p>
                    )}
                    <LoginButton />
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
