import { NextResponse } from "next/server";

export async function middleware(request) {
  // Get token from cookies
  const token = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  console.log("Middleware - Path:", path);
  console.log("Middleware - Token exists:", !!token);

  // Public paths
  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/forgot-password" ||
    path === "/reset-password";

  // Dashboard paths
  const isAdminPath = path.startsWith("/dashboard/admin");
  const isUserPath = path.startsWith("/dashboard/user");

  // If trying to access public paths while logged in
  if (isPublicPath && token) {
    console.log("User logged in, redirecting to dashboard");
    // Since we can't verify role, redirect to user dashboard by default
    return NextResponse.redirect(new URL("/dashboard/user", request.url));
  }

  // If trying to access protected paths without token
  if (!isPublicPath && !token) {
    console.log("No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow access to protected paths if token exists
  // We'll let the client-side handle role-based redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
  ],
};
