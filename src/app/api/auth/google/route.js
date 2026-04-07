import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { success: false, message: "BACKEND_URL is not set" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(`${backendUrl}/api/v1/auth/google`);
}