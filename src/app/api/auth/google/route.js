import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL;
  const incomingUrl = new URL(req.url);
  
  // Directly redirect to backend — backend itself will redirect back to frontend
  const backendCallbackUrl = `${backendUrl}/api/v1/auth/google/callback${incomingUrl.search}`;
  
  return NextResponse.redirect(backendCallbackUrl);
}