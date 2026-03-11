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

const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/checkout",
];

const adminRoutes = [
    "/dashboard/admin",
];

export default function middleware(req) {

    const path = req.nextUrl.pathname;

    const token = req.cookies.get("authToken")?.value;
    const role = req.cookies.get("role")?.value;

    const isPublicRoute = publicRoutes.some((route) =>
        path.startsWith(route)
    );

    const isProtectedRoute = protectedRoutes.some((route) =>
        path.startsWith(route)
    );

    const isAdminRoute = adminRoutes.some((route) =>
        path.startsWith(route)
    );

    // 🔒 Protected routes
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 👑 Admin routes
    if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // 🔁 Logged in user login/signup page এ গেলে redirect
    if (token && (path === "/login" || path === "/signup")) {
        if (role === "admin") {
            return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};