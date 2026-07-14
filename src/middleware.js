import { NextResponse } from "next/server";
import {
    isPublicRoute,
    isGuestOnlyRoute,
    isProtectedRoute,
    isAdminRoute,
    isApiRoute,
} from "@/config/routes";

/**
 * Decode JWT payload
 */
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

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;
    return payload.exp * 1000 <= Date.now();
}

export function middleware(request) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const userRole = request.cookies.get("userRole")?.value;
    const { pathname } = request.nextUrl;

    // ************* PUBLIC ROUTES - Always accessible *************

    if (isPublicRoute(pathname)) {
        // Guest-only routes redirect authenticated users
        if (isGuestOnlyRoute(pathname)) {
            const hasValidToken = accessToken && !isTokenExpired(accessToken);
            if (hasValidToken) {
                const dashboard = userRole === "admin" ? "/dashboard/admin" : "/dashboard/user";
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
        const hasAccessToken = Boolean(accessToken);
        const hasRefreshToken = Boolean(refreshToken);
        const accessExpired = hasAccessToken ? isTokenExpired(accessToken) : true;

        // No tokens at all
        if (!hasAccessToken && !hasRefreshToken) {
            const url = new URL("/login", request.url);
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }

        // Valid access token
        if (hasAccessToken && !accessExpired) {
            // Admin route check
            if (isAdminRoute(pathname) && userRole !== "admin") {
                return NextResponse.redirect(new URL("/dashboard/user", request.url));
            }
            return NextResponse.next();
        }

        // Has refresh token - allow through (client will refresh)
        if (hasRefreshToken) {
            return NextResponse.next();
        }

        // Session expired - redirect to login
        const url = new URL("/login", request.url);
        url.searchParams.set("session", "expired");
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