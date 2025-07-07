import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const protectedRoutes = ['/admin'];
const publicRoutes = ['/login'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((prefix) => path.startsWith(prefix));
  const isPublicRoute = publicRoutes.some((prefix) => path.startsWith(prefix));

  const sessionCookie = cookies().get('session')?.value;
  const session = await decrypt(sessionCookie);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl.origin));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)'],
};
