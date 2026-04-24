import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // Allow admin login page without session
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect /account/* — redirect to user login
  if (pathname.startsWith('/account')) {
    if (!sessionCookie || sessionCookie.length < 20) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Clear invalid session cookie
      response.cookies.delete('session');
      return response;
    }
  }

  // Protect /admin/* — redirect to admin login (separate page)
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie || sessionCookie.length < 20) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  const response = NextResponse.next();

  // Prevent caching of authenticated pages
  if (pathname.startsWith('/account') || pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }

  return response;
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
