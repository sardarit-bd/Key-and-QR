/**
 * Centralized Route Configuration
 * All routes in one place for maintainability
 */

// ============================================================
// PUBLIC ROUTES - No authentication required
// ============================================================

export const publicRoutePatterns = [
    // Main pages
    "/",
    "/shop",
    "/shop/:path*",
    "/how-it-works",
    "/inspiration",

    // Auth pages
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/callback",

    // QR scan
    "/t/:path*",

    // CHECKOUT FLOW - Guest accessible
    "/cart",
    "/checkout",
    "/checkout/:path*",
    "/payment/:path*",
    "/payment/success",
    "/payment/cancel",
    "/success",
    "/cancel",

    // Static pages
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/shipping",
];

// ============================================================
// GUEST-ONLY ROUTES - Redirect authenticated users
// ============================================================

export const guestOnlyPatterns = [
    "/login",
    "/signup",
];

// ============================================================
// PROTECTED ROUTES - Require authentication
// ============================================================

export const protectedPatterns = [
    // Dashboard
    "/dashboard",
    "/dashboard/:path*",

    // Profile
    "/profile",
    "/profile/:path*",

    // Favorites (authenticated only)
    "/favorites",
    "/favorites/:path*",

    // Orders (authenticated only)
    "/orders",
    "/orders/:path*",

    // Subscription management (authenticated only)
    "/subscription",
    "/subscription/:path*",

    // User quotes
    "/my-quotes",
    "/my-quotes/:path*",
    "/saved-quotes",
    "/saved-quotes/:path*",

    // User library
    "/library",
    "/library/:path*",
];

// ============================================================
// ADMIN ROUTES - Require admin role
// ============================================================

export const adminPatterns = [
    "/dashboard/admin",
    "/dashboard/admin/:path*",
    "/admin",
    "/admin/:path*",
];

// ============================================================
// HELPERS
// ============================================================

export const isPublicRoute = (pathname) => {
    if (pathname === "/") return true;
    return publicRoutePatterns.some((pattern) => {
        if (pattern.includes(":path*")) {
            const base = pattern.replace("/:path*", "");
            return pathname.startsWith(base);
        }
        return pathname === pattern;
    });
};

export const isGuestOnlyRoute = (pathname) => {
    return guestOnlyPatterns.some((pattern) => pathname === pattern);
};

export const isProtectedRoute = (pathname) => {
    return protectedPatterns.some((pattern) => {
        if (pattern.includes(":path*")) {
            const base = pattern.replace("/:path*", "");
            return pathname.startsWith(base);
        }
        return pathname === pattern;
    });
};

export const isAdminRoute = (pathname) => {
    return adminPatterns.some((pattern) => {
        if (pattern.includes(":path*")) {
            const base = pattern.replace("/:path*", "");
            return pathname.startsWith(base);
        }
        return pathname === pattern;
    });
};

export const isApiRoute = (pathname) => {
    return pathname.startsWith("/api");
};