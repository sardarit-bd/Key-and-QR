import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
    isPublicRoute,
    isGuestOnlyRoute,
    isProtectedRoute,
    isAdminRoute,
    isApiRoute,
} from "@/config/routes";

/**
 * Verify JWT access token with signature verification.
 * Uses jose (Edge-compatible) instead of jsonwebtoken.
 * Returns decoded payload if valid, null if invalid/expired.
 */
async function verifyAccessToken(token) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

/**
 * Clear authentication cookies
 */
function clearAuthCookies(response) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
}

export async function middleware(request) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const { pathname } = request.nextUrl;

    // ************* PUBLIC ROUTES - Always accessible *************

    if (isPublicRoute(pathname)) {
        // Guest-only routes redirect authenticated users
        if (isGuestOnlyRoute(pathname) && accessToken) {
            const payload = await verifyAccessToken(accessToken);
            if (payload) {
                const dashboard = payload.role === "admin" ? "/dashboard/admin" : "/dashboard/user";
                return NextResponse.redirect(new URL(dashboard, request.url));
            }
        }
        return NextResponse.next();
    }

    // ************* API ROUTES - Pass through (backend handles auth) *************

    if (isApiRoute(pathname)) {
        return NextResponse.next();
    }

    // ************* PROTECTED ROUTES - Require authentication *************

    if (isProtectedRoute(pathname)) {
        // 1. Valid access token: verify and allow through
        if (accessToken) {
            const payload = await verifyAccessToken(accessToken);

            if (payload) {
                // Admin route check - regular users cannot access admin routes
                if (isAdminRoute(pathname) && payload.role !== "admin") {
                    return NextResponse.redirect(new URL("/dashboard/user", request.url));
                }

                // User dashboard route check - admins accessing user dashboard are routed to admin panel
                if (pathname.startsWith("/dashboard/user") && payload.role === "admin") {
                    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
                }

                return NextResponse.next();
            }
        }

        // 2. Access token missing or expired, but refresh token exists:
        // DO NOT redirect to /login?session=expired. Pass through to allow client-side silent refresh
        if (refreshToken) {
            return NextResponse.next();
        }

        // 3. No tokens at all - redirect to login with return path
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // ************* DEFAULT - Allow all other routes *************

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
    ],
};
