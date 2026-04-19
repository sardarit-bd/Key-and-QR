import { NextResponse } from "next/server";

function decodeJwtPayload(token) {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    const normalized = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + (4 - (normalized.length % 4 || 4)) % 4,
      "="
    );

    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export function middleware(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;

  const publicPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/callback",
  ];

  const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

  if (
    pathname === "/" ||
    pathname.startsWith("/t/") ||
    pathname.startsWith("/shop")
  ) {
    return NextResponse.next();
  }

  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(refreshToken);
  const accessExpired = hasAccessToken ? isExpired(accessToken) : true;

  // protected route
  if (!isPublicPage) {
    if (!hasAccessToken && !hasRefreshToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (hasAccessToken && !accessExpired) {
      return NextResponse.next();
    }

    if (hasRefreshToken) {
      return NextResponse.next();
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("session", "expired");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicPage && hasAccessToken && !accessExpired) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/user", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/callback",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};