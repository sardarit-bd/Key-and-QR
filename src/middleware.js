import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;
  
  // Public pages - no auth required
  const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback', '/t', '/shop'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Home page is public
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Protected routes - require token
  if (!isPublicPage && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Already logged in - redirect from login/signup to dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    const userRole = request.cookies.get('userRole')?.value;
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/callback',
    '/dashboard/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/t/:path*',
    '/shop/:path*',
  ],
};