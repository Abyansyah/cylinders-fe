import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'session_token';
const PROTECTED_ROUTES = ['/dashboard', '/users'];
const AUTH_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!sessionToken && isProtectedRoute) {
    const absoluteURL = new URL('/login', request.url);
    return NextResponse.redirect(absoluteURL.toString());
  }

  if (sessionToken && isAuthRoute) {
    const absoluteURL = new URL('/dashboard', request.url);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
