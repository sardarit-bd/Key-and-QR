import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/shop",
  "/subscription",
];

const protectedRoutes = ["/dashboard", "/profile", "/checkout"];
const adminRoutes = ["/dashboard/admin"];

export default function middleware(req) {
  const path = req.nextUrl.pathname;

  const refreshToken = req.cookies.get("refreshToken")?.value;

  const role = req.cookies.get("userRole")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  // Protected route check
  if (isProtectedRoute && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin route check
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (refreshToken && (path === "/login" || path === "/signup")) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard/user", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
