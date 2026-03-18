"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
  const router = useRouter();
  const { user, accessToken, isLoading, error, logout, ...actions } =
    useAuthStore();

  const isAuthenticated = !!user && !!accessToken;
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const redirectToDashboard = () => {
    if (isAdmin) {
      router.push("/dashboard/admin");
    } else if (isUser) {
      router.push("/dashboard/user");
    }
  };

  const requireAuth = (redirectTo = "/login") => {
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo);
      }
    }, [isLoading, isAuthenticated, router, redirectTo]);
  };

  const requireGuest = (redirectTo = "/dashboard") => {
    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        if (isAdmin) {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user");
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, router]);
  };

  const requireRole = (allowedRoles, redirectTo = "/login") => {
    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push(redirectTo);
        } else if (!allowedRoles.includes(user?.role)) {
          router.push("/dashboard/user");
        }
      }
    }, [isLoading, isAuthenticated, user, allowedRoles, router]);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isUser,
    redirectToDashboard,
    requireAuth,
    requireGuest,
    requireRole,
    logout,
    ...actions,
  };
};
