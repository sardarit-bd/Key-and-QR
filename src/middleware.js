import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

async function verifyJWT(token) {
    try {
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
        const { payload } = await jwtVerify(token, secret, {
            clockTolerance: 30 // allow 30 seconds difference
        });
        return payload;
    } catch (err) {
        console.log("JWT Error:", err);
        return null;
    }
}


export default async function middleware(req) {

    const path = req.nextUrl.pathname;
    const token = req.cookies.get("authToken")?.value;
    const role = req.cookies.get("role")?.value;



    // Check token validity
    const decoded = token ? await verifyJWT(token) : null;


    // Protected routes
    const protectedRoutes = ['/dashboard'];
    const isProtected = protectedRoutes.some(route => path.startsWith(route));



    if (!decoded) {

        const res = NextResponse.redirect(new URL("/login", req.nextUrl));

        // Clear cookies correctly on the response
        ["ID", "role", "authToken", "name"].forEach(cookieName => {
            res.cookies.set(cookieName, "", {
                path: "/",
                maxAge: 0, // delete cookie
            });
        });
    }



    // If not logged in but trying to access protected routes
    if (!decoded && isProtected) {

        const res = NextResponse.redirect(new URL("/login", req.nextUrl));
        return res;

    }

    // Role-based access
    if (decoded && role) {
        if (role == "admin" && path.startsWith("/dashboard/user")) {
            return NextResponse.redirect(new URL("/dashboard/admin", req.nextUrl));
        }
    }

    if (decoded && role) {
        if (role == "user" && path.startsWith("/dashboard/admin")) {
            return NextResponse.redirect(new URL("/dashboard/user", req.nextUrl));
        }
    }

    // If logged in but trying to visit signin page
    if (decoded && path.startsWith("/login")) {
        const redirects = {
            "admin": "/dashboard/admin",
            "user": "/dashboard/user",
        };
        if (role && redirects[role]) return NextResponse.redirect(new URL(redirects[role], req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};