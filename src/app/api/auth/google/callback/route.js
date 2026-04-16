import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  const incomingUrl = new URL(req.url);
  
  const backendCallbackUrl = `${backendUrl}/api/v1/auth/google/callback${incomingUrl.search}`;
  
  console.log("Forwarding to backend callback:", backendCallbackUrl);
  
  try {
    const response = await fetch(backendCallbackUrl, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    
    const location = response.headers.get("location");
    
    if (location) {
      console.log("Backend redirect location:", location);
      
      // Check if location already has tokens
      if (location.includes('accessToken')) {
        console.log("Tokens found in redirect URL, passing through");
        return NextResponse.redirect(new URL(location, frontendUrl));
      }
      
      // Otherwise, construct redirect with any query params
      const url = new URL(location, frontendUrl);
      return NextResponse.redirect(url);
    }
    
    // Try to get response body
    const text = await response.text();
    console.log("Response body:", text);
    
    return NextResponse.redirect(new URL("/login?error=no_redirect", frontendUrl));
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", frontendUrl));
  }
}