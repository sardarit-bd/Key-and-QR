"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthSuccess() {
    const router = useRouter();
    const { user, isInitialized, initializeAuth } = useAuthStore();

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    useEffect(() => {
        if (isInitialized && user) {
            if (user.role === "admin") {
                router.push("/new-dashboard/admin");
            } else {
                router.push("/new-dashboard/user");
            }
        } else if (isInitialized && !user) {
            router.push("/login?error=auth_failed");
        }
    }, [user, isInitialized, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
}