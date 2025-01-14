import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('firebase-auth-token');

  // If trying to access protected routes without auth
  if (!authCookie && (request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname.startsWith('/create-event'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access auth pages while logged in
  if (authCookie && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/create-event/:path*', '/login', '/signup'],
}; 