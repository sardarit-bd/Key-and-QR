import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  // Direct redirect to backend
  return NextResponse.redirect(`${backendUrl}/api/v1/auth/google`);
}