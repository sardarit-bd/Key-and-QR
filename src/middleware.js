import { NextResponse } from "next/server";

export function middleware(request) {
  // 🔥 Check both cookie and header
  let token = request.cookies.get('accessToken')?.value;
  
  // Also check Authorization header if present
  const authHeader = request.headers.get('authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  const { pathname } = request.nextUrl;
  
  const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  if (pathname === '/' || pathname.startsWith('/t/') || pathname.startsWith('/shop')) {
    return NextResponse.next();
  }
  
  // 🔥 Check if token is expired
  let isExpired = true;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isExpired = payload.exp * 1000 < Date.now();
    } catch (e) {
      isExpired = true;
    }
  }
  
  // 🔥 If token expired but refresh token exists, let it pass (frontend will refresh)
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  if (!isPublicPage && (!token || isExpired)) {
    // If refresh token exists, let frontend handle refresh
    if (refreshToken && !isExpired) {
      return NextResponse.next();
    }
    
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  if (token && !isExpired && (pathname === '/login' || pathname === '/signup')) {
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