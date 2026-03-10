import { NextResponse } from "next/server";

export default async function middleware(req) {
    const path = req.nextUrl.pathname;

    // Get cookies directly
    const token = req.cookies.get("authToken")?.value;
    const role = req.cookies.get("role")?.value;

    console.log("Middleware - Path:", path);
    console.log("Middleware - Token exists:", !!token);
    console.log("Middleware - Role:", role);

    // Public routes (no auth needed)
    const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
    const isPublicRoute = publicRoutes.includes(path) || path === "/";

    // If no token and trying to access protected route
    if (!token && !isPublicRoute && !path.startsWith("/api/") && !path.startsWith("/_next/")) {
        console.log("Redirecting to login - No token");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // If has token
    if (token) {
        // Redirect from login/signup to appropriate dashboard
        if (path === "/login" || path === "/signup") {
            if (role === "admin") {
                console.log("Redirecting admin to dashboard");
                return NextResponse.redirect(new URL("/dashboard/admin", req.url));
            } else {
                console.log("Redirecting user to dashboard");
                return NextResponse.redirect(new URL("/dashboard/user", req.url));
            }
        }

        // Role-based access control
        if (role === "admin" && path.startsWith("/dashboard/user")) {
            return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        }

        if (role === "user" && path.startsWith("/dashboard/admin")) {
            return NextResponse.redirect(new URL("/dashboard/user", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};