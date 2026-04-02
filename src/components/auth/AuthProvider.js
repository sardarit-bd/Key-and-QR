"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthProvider({ children }) {
  const { initializeAuth, isInitialized, loading } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  const isPublicAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/callback";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (isPublicAuthPage) return;
    if (isInitialized || loading) return;

    initializeAuth();
  }, [
    isClient,
    isPublicAuthPage,
    isInitialized,
    loading,
    initializeAuth,
  ]);

  if (!isClient) return null;

  return <>{children}</>;
}