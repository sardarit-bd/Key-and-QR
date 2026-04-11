import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL || 'https://key-and-qr-backend.vercel.app';
  const redirectUrl = `${backendUrl}/api/v1/auth/google`;
  
  return NextResponse.redirect(redirectUrl);
}