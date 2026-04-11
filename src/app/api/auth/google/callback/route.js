import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL || 'https://key-and-qr-backend.vercel.app';
  const incomingUrl = new URL(req.url);
  const backendCallbackUrl = `${backendUrl}/api/v1/auth/google/callback${incomingUrl.search}`;
  
  const response = await fetch(backendCallbackUrl, {
    method: "GET",
    redirect: "manual",
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
  });
  
  const location = response.headers.get("location");
  const redirectPath = location 
    ? new URL(location).pathname + new URL(location).search
    : "/callback?success=true";
  
  const nextResponse = NextResponse.redirect(new URL(redirectPath, req.url));
  
  // ✅ Pass through cookies from backend
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    nextResponse.headers.set("set-cookie", setCookie);
  }
  
  return nextResponse;
}