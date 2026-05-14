import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // Allow admin login page without session
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // NOTE: /account/* used to be guarded here, but the server session cookie
  // can be transiently missing right after Google Identity Services sign-in
  // (the createSessionCookie POST is async), causing legitimate logged-in
  // customers to get bounced to /login when they tapped Orders / Wishlist.
  // The customer pages already enforce auth client-side via
  // `app/account/layout.tsx` (redirects to /login when !user). So we now
  // only proxy-guard the admin surface, where the session cookie's presence
  // is more stable (admins log in via email + access code, no GIS race).

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
