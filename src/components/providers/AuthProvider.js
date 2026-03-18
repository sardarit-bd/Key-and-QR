"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function AuthProvider({ children }) {
  const { initAuth, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
}
