import { NextResponse } from "next/server";

export async function GET(request) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5001';
  
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect");
  const target = redirect
    ? `${backendUrl}/api/v1/auth/google?redirect=${encodeURIComponent(redirect)}`
    : `${backendUrl}/api/v1/auth/google`;

  // Direct redirect to backend
  return NextResponse.redirect(target);
}