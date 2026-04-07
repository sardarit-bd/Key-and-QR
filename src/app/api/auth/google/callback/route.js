import { NextResponse } from "next/server";

export async function GET(req) {
  const backendUrl = process.env.BACKEND_URL;
  const incomingUrl = new URL(req.url);

  const backendCallbackUrl = `${backendUrl}/api/v1/auth/google/callback${incomingUrl.search}`;

  const backendRes = await fetch(backendCallbackUrl, {
    method: "GET",
    redirect: "manual",
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
  });

  const location = backendRes.headers.get("location");
  const redirectPath = location
    ? new URL(location).pathname + new URL(location).search
    : "/callback?success=true";

  const response = NextResponse.redirect(new URL(redirectPath, req.url));

  const rawSetCookie = backendRes.headers.get("set-cookie");
  if (rawSetCookie) {
    response.headers.set("set-cookie", rawSetCookie);
  }

  return response;
}