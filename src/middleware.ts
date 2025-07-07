import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const protectedRoutes = ['/admin'];
const publicRoutes = ['/login'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Determine if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((prefix) => path.startsWith(prefix));

  // If the route is not protected, continue without checks
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // If it's a protected route, check for a valid session
  const sessionCookie = cookies().get('session')?.value;
  const session = await decrypt(sessionCookie);
  
  // If no valid session, redirect to the login page
  if (!session) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    // Optionally preserve the originally requested URL as a query param
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  // If session is valid, allow access
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)'],
};
