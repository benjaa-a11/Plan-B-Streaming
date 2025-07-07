'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';

export async function login(prevState: { error: string | undefined }, formData: FormData) {
  const password = formData.get('password');

  if (password === process.env.ADMIN_PASSWORD) {
    await createSession();
    redirect('/admin');
  }

  return { error: 'Contraseña incorrecta.' };
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
