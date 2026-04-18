"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthProvider({ children }) {
  const { initializeAuth, isInitialized, isLoading } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  const isPublicPage = pathname === "/login" || 
                      pathname === "/signup" || 
                      pathname === "/forgot-password" || 
                      pathname === "/reset-password" ||
                      pathname === "/callback";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (isPublicPage) return;
    if (isInitialized || isLoading) {
      console.log("Auth already:", { isInitialized, isLoading });
      return;
    }

    console.log("🟢 Initializing auth");
    initializeAuth();
  }, [isClient, isPublicPage, isInitialized, isLoading, initializeAuth]);

  if (!isClient) return null;

  return <>{children}</>;
}