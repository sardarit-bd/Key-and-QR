"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Loader from "@/shared/Loader";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      console.log("🔵 Callback page loaded");
      
      // Get tokens from URL params
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const userParam = searchParams.get("user");
      const error = searchParams.get("error");

      if (error) {
        console.error("🔴 Error in callback:", error);
        router.replace(`/login?error=${error}`);
        return;
      }

      // 🔥 Save tokens and user to localStorage
      if (accessToken && refreshToken && userParam) {
        console.log("🟢 Saving tokens to localStorage...");
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Set cookies for middleware
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
        
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log("🟢 User saved:", user.email);
          localStorage.setItem('user', JSON.stringify(user));
          document.cookie = `userRole=${user.role}; path=/; max-age=604800; SameSite=Lax`;
        } catch (e) {
          console.error("🔴 Error parsing user:", e);
        }
        
        // 🔥 Redirect to dashboard (no API call)
        const role = JSON.parse(decodeURIComponent(userParam)).role;
        if (role === "admin") {
          window.location.href = "/dashboard/admin";
        } else {
          window.location.href = "/dashboard/user";
        }
      } else {
        console.error("🔴 Missing tokens in callback");
        router.replace("/login?error=missing_tokens");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader text="Completing login..." size={40} fullScreen={false} />
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}