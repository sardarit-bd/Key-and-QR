"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthProvider({ children }) {
  const { initializeAuth, isInitialized, loading } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/auth/callback");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (isAuthPage) return;

    if (!isInitialized && !loading) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized, loading, isClient, isAuthPage]);

  if (!isClient) return null;

  if (!isAuthPage && !isInitialized && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}