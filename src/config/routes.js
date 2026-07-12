// ============================================================
// PUBLIC ROUTES - No authentication required
// ============================================================

export const publicRoutePatterns = [
    "/",
    "/shop",
    "/shop/:path*",
    "/how-it-works",
    "/inspiration",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/callback",
    "/t/:path*",
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
    "/dashboard",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout",
    "/checkout/:path*",
    "/cart",
    "/payment/:path*",
    "/subscription/:path*",
    "/orders/:path*",
];

// ============================================================
// ADMIN ROUTES - Require admin role
// ============================================================

export const adminPatterns = [
    "/dashboard/admin",
    "/dashboard/admin/:path*",
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