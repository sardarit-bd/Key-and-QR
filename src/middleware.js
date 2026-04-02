import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("userRole")?.value;

  const isPublicPath =
    path === "/" ||
    path === "/login" ||
    path === "/signup" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/shop" ||
    path === "/subscription";

  const isDashboardPath = path.startsWith("/dashboard");
  const isProfilePath = path.startsWith("/profile");
  const isCheckoutPath = path.startsWith("/checkout");
  const isAdminPath = path.startsWith("/dashboard/admin");

  const isProtectedPath =
    isDashboardPath || isProfilePath || isCheckoutPath;

  // Logged in user trying to access login/signup
  if ((path === "/login" || path === "/signup") && refreshToken) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/user", request.url));
  }

  // Protected route without login
  if (isProtectedPath && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin route protection
  if (isAdminPath && refreshToken && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};