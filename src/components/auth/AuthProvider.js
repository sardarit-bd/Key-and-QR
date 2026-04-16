"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthProvider({ children }) {
  const { initializeAuth, isInitialized, isLoading, user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Public pages where we don't need auth
  const isPublicPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/callback" ||
    pathname === "/" ||
    pathname?.startsWith("/t/") ||
    pathname?.startsWith("/shop");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (isPublicPage) return;  // Skip auth on public pages
    if (isInitialized || isLoading) return;

    console.log("🟢 Initializing auth for:", pathname);
    initializeAuth();
  }, [isClient, isPublicPage, isInitialized, isLoading, initializeAuth, pathname]);

  if (!isClient) return null;

  return <>{children}</>;
}