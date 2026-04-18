import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  // Forward all query params to backend
  const url = new URL(req.url);
  const queryString = url.search;
  
  // Redirect to backend callback
  const backendCallbackUrl = `${backendUrl}/api/v1/auth/google/callback${queryString}`;
  
  console.log("Forwarding to:", backendCallbackUrl);
  
  // Just redirect - let backend handle everything
  return NextResponse.redirect(backendCallbackUrl);
}