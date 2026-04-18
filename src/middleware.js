import { NextResponse } from "next/server";

export function middleware(request) {
  
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;
  
  console.log("Middleware - Path:", pathname, "Has Token:", !!accessToken);
  
  // Public pages
  const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Home & public routes
  if (pathname === '/' || pathname.startsWith('/t/') || pathname.startsWith('/shop')) {
    return NextResponse.next();
  }
  
  // Protected routes
  if (!isPublicPage && !accessToken) {
    console.log("No token, redirecting to login");
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Already logged in
  if (accessToken && (pathname === '/login' || pathname === '/signup')) {
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
  ],
};