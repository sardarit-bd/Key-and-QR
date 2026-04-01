"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
    children,
    allowedRoles = [],
}) {
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
            router.replace("/unauthorized");
        }
    }, [user, isInitialized, allowedRoles, router]);

    if (!isInitialized) {
        return <LoadingSpinner />;
    }

    if (!user) return null;

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return null;
    }

    return children;
}