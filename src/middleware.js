import { NextResponse } from "next/server";

export function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/callback",
  ],
};


































// import { NextResponse } from "next/server";

// export function middleware(request) {
//   const path = request.nextUrl.pathname;

//   const refreshToken = request.cookies.get("refreshToken")?.value;
//   const role = request.cookies.get("userRole")?.value;

//   const isDashboardPath = path.startsWith("/dashboard");
//   const isProfilePath = path.startsWith("/profile");
//   const isCheckoutPath = path.startsWith("/checkout");
//   const isAdminPath = path.startsWith("/dashboard/admin");

//   const isProtectedPath = isDashboardPath || isProfilePath || isCheckoutPath;

//   if ((path === "/login" || path === "/signup") && refreshToken) {
//     if (role === "admin") {
//       return NextResponse.redirect(new URL("/dashboard/admin", request.url));
//     }
//     return NextResponse.redirect(new URL("/dashboard/user", request.url));
//   }

//   if (isProtectedPath && !refreshToken) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (isAdminPath && refreshToken && role !== "admin") {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/login",
//     "/signup",
//     "/dashboard/:path*",
//     "/profile/:path*",
//     "/checkout/:path*",
//   ],
// };