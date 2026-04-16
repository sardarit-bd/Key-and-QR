import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const redirectUrl = `${backendUrl}/api/v1/auth/google`;
  
  console.log("Redirecting to backend Google OAuth:", redirectUrl);
  return NextResponse.redirect(redirectUrl);
}