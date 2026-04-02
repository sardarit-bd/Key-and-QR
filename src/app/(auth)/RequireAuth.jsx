"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children, adminOnly = false }) {
    const router = useRouter();
    const { user, isInitialized, loading, initializeAuth } = useAuthStore();

    useEffect(() => {
        if (!isInitialized && !loading) {
            initializeAuth();
        }
    }, [isInitialized, loading, initializeAuth]);

    useEffect(() => {
        if (!isInitialized || loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (adminOnly && user.role !== "admin") {
            router.replace("/");
        }
    }, [user, isInitialized, loading, adminOnly, router]);

    if (!isInitialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;
    if (adminOnly && user.role !== "admin") return null;

    return children;
}