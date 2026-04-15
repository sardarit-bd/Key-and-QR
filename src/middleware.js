import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;
  
  const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback', '/t'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Check if trying to access protected routes without token
  if (!isPublicPage && !token && pathname !== '/') {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirect to dashboard if already logged in and trying to access login
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/callback',
    '/t/:path*',
  ],
};