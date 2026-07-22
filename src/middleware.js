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
        // Try to verify access token
        if (accessToken) {
            const payload = await verifyAccessToken(accessToken);

            // Valid access token
            if (payload) {
                // Admin route check - use verified role from JWT
                if (isAdminRoute(pathname) && payload.role !== "admin") {
                    return NextResponse.redirect(new URL("/dashboard/user", request.url));
                }
                return NextResponse.next();
            }

            // Invalid/expired access token - clear and redirect to login
            if (!refreshToken) {
                const response = NextResponse.redirect(
                    new URL("/login?session=expired", request.url)
                );
                return clearAuthCookies(response);
            }
        }

        // No access token but has refresh token - allow through (client will refresh)
        if (refreshToken) {
            return NextResponse.next();
        }

        // No tokens at all - redirect to login
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // ************* DEFAULT - Allow all other routes *************

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/callback",
        "/dashboard/:path*",
        "/profile/:path*",
        "/checkout/:path*",
        "/cart",
        "/payment/:path*",
        "/subscription/:path*",
        "/orders/:path*",
        "/api/:path*",
        "/shop/:path*",
        "/t/:path*",
        "/how-it-works",
        "/inspiration",
        "/about",
        "/contact",
        "/faq",
        "/privacy",
        "/terms",
        "/shipping",
        "/success",
        "/cancel",
    ],
};
